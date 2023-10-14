import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import ReactPaginate from 'react-paginate';
import { useAuth } from './useAuth';
import jwt from 'jsonwebtoken';
import Image from 'next/image';
import jlc from "../../../public/logojlc.png"
import { HiOutlineLogout } from 'react-icons/hi';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { AiFillAccountBook, AiOutlineUserAdd } from 'react-icons/ai';
import { BsPrinter } from 'react-icons/bs';


const Customers = ({ customer }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [customerData, setCustomerData] = useState([]);
    const [isAddingData, setIsAddingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userid, setUserid] = useState('');
    const [role, setRole] = useState('');

    const router = useRouter();

    useEffect(() => {
        // Get the user's role from the JWT token in local storage
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwt.decode(token);
            if (decodedToken) {
                setRole(decodedToken.role);
            }
        }
    }, []);


    useEffect(() => {
        // Get the userid from local storage
        const storedUserid = localStorage.getItem('userid');

        if (storedUserid) {
            setUserid(storedUserid);
        }
    }, []);




    const filteredCustomerData = customerData.customer
        ? customerData.customer.filter((customer) =>
            customer.customerid.includes(searchQuery) ||
            customer.customername.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/getcustomer');
                setCustomerData(response.data);
                setIsLoading(false); // Turn off loading state after data fetch
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false); // Turn off loading state on error as well
            }
        };
        fetchData();
    }, []);

    const calculateBalanceForCustomer = (customer) => {
        let balance = parseFloat(customer.initialbalance);

        for (const entry of customer.data) {
            // Round the "dr" value to the nearest integer
            const dr = Math.round(parseFloat(entry.dr));
            const cr = parseFloat(entry.cr) || 0; // Use 0 if cr is empty or NaN

            balance += dr - cr;
        }
        const formattedBalance = balance.toLocaleString('en-IN'); // 'en-IN' for the Indian numbering format with commas

        if (balance < 0) {
            return `${Math.abs(formattedBalance).toFixed(2)} ADV`;
        }

        return formattedBalance;
    };

    useEffect(() => {
        if (role === 'user' && customerData.customer) {
            // Check if the user's `phoneno` matches a `phoneno` in the customer data
            const customerMatch = customerData.customer.find(customer => customer.phoneno === userid);

            if (customerMatch) {
                // Redirect the user to their specific customer page based on `customerid`
                router.push(`/customers/${customerMatch.customerid}`);
            }
        }
    }, [role, userid, customerData, router]);




    const calculateTotalBalance = (customerData) => {
        let totalBalance = 0;

        customerData.customer.forEach((customer) => {
            totalBalance += parseFloat(customer.initialbalance);
            customer.data.forEach((entry) => {
                const dr = Math.round(parseFloat(entry.dr));
                const cr = Math.round(parseFloat(entry.cr)) || 0; // Use 0 if cr is empty or NaN
                totalBalance += dr - cr;
            });
        });
        const formattedtotalbalance = totalBalance.toLocaleString('en-IN');

        return formattedtotalbalance;
    };

    const handlePrint = () => {
        window.print();
    };







    const reassignCustomerIds = (newCustomerData) => {
        newCustomerData.forEach((customer, index) => {
            customer.customerid = (index + 1).toString();
        });
    };
    const handleSearchClick = () => {
        setPageNumber(0);
    };

    const handleEditClick = (pageIndex, indexWithinPage) => {
        setIsEditing(true);
        setEditingIndex({ pageIndex, indexWithinPage }); // Store both page index and index within page
        const customerToEdit = displayedCustomers[indexWithinPage]; // Access data from the displayedCustomers array
        setNewData({
            customerid: customerToEdit.customerid,
            customername: customerToEdit.customername,
            phoneno: customerToEdit.phoneno,
            phoneno2: customerToEdit.phoneno2,
            initialbalance: customerToEdit.initialbalance,
        });
    };
    const savedPageNumber = typeof window !== 'undefined' ? localStorage.getItem('currentPageNumber') : null;
    const [pageNumber, setPageNumber] = useState(savedPageNumber ? parseInt(savedPageNumber) : 0);

    // Number of customers to display per page
    const customersPerPage = 15;

    // Calculate the offset based on the page number
    const offset = pageNumber * customersPerPage;

    // Slice the customer data to display only the current page
    const displayedCustomers = filteredCustomerData.slice(offset, offset + customersPerPage);

    // Calculate the total number of pages
    const pageCount = Math.ceil(filteredCustomerData.length / customersPerPage);

    // Function to handle page change
    const handlePageClick = (data) => {
        const selectedPage = data.selected;
        setPageNumber(selectedPage);
    };
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Store the current page number in localStorage whenever it changes
            localStorage.setItem('currentPageNumber', pageNumber.toString());
        }
    }, [pageNumber]);
    const goToLastPage = () => {
        const lastPage = pageCount - 1; // Calculate the last page number
        setPageNumber(lastPage); // Update the pageNumber state
    };
    const goToFirstPage = () => {
        setPageNumber(0); // Update the pageNumber state to 0 for the first page
    };

    const handleDeleteClick = async (customerid) => {
        const shouldDelete = window.confirm("Are you sure you want to delete this customer?");
        if (!shouldDelete) {
            return; // If user cancels deletion, do nothing
        }

        try {
            await axios.delete(`/api/deletecustomer?customerid=${customerid}`);

            // Update customerData state after successful deletion
            const updatedCustomerData = customerData.customer.filter(customer => customer.customerid !== customerid);
            reassignCustomerIds(updatedCustomerData); // Reassign customer IDs
            setCustomerData({ customer: updatedCustomerData });

            // Call the updateCustomerIds API to reassign customer IDs in the database
            await axios.post('/api/updateCustomerIds');
            window.location.reload(true);
        } catch (error) {
            console.error("Error deleting customer:", error);
        }
    };







    const [newData, setNewData] = useState({
        customerid: '',
        customername: '',
        phoneno: '',
        phoneno2: '',
        initialbalance: '',
    });




    const handleAddDataClick = () => {
        setIsAddingData(true);
        setNewData({
            customerid: '',
            customername: '',
            phoneno: '',
            phoneno2: '',
            initialbalance: '',
        });
        setEditingIndex(null);
    };


    const handleViewData = (customerid) => {
        // Navigate to the DetailPage with the corresponding customerid
        window.location.href = `/customers/${customerid}`;
    };





    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddCustomer = async () => {
        try {
            // Construct the new customer data
            const newCustomerData = {
                customerid: (customerData.customer.length + 1).toString(), // Generate a new customer id
                customername: newData.customername,
                phoneno: newData.phoneno,
                phoneno2: newData.phoneno2,
                initialbalance: newData.initialbalance,
                data: [] // Initialize with an empty array for other data
            };

            const response = await axios.post('/api/addcustomer', [newCustomerData]);

            // Update customerData state after successful add
            fetchData();
            setIsAddingData(false);
            setNewData({
                customerid: '',
                customername: '',
                phoneno: '',
                phoneno2: '',
                initialbalance: '',
            });
            setTimeout(() => {
                window.location.reload(true);
            }, 1500);

        } catch (error) {
            console.error("Error adding customer:", error);
        }
    };

    const handleUpdateCustomer = async () => {
        try {

            const response = await axios.put(
                `/api/updatecustomer?customerid=${newData.customerid}`,
                newData
            );

            // Update customerData state after successful update
            fetchData();
            setIsEditing(false);
            setEditingIndex(null);
            setNewData({
                customerid: '',
                customername: '',
                phoneno: '',
                phoneno2: '',
                initialbalance: '',
            });
            window.location.reload(true);
        } catch (error) {
            console.error("Error updating customer:", error);
        }
    };
    const handleSaveChanges = async () => {
        try {
            const shouldSubmit = window.confirm("Are you sure you want to save the changes?");
            if (!shouldSubmit) {
                return; // User canceled submission
            }

            await handleUpdateCustomer(); // Call the update handler

            // Close the edit block and reset new data
            setIsEditing(false);
            setEditingIndex(null);
            setNewData({
                customerid: '',
                customername: '',
                phoneno: '',
                phoneno2: '',
                initialbalance: '',
            });

            // Fetch the data again to reflect changes
            // fetchData();
            window.location.reload(true);
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    };
    const isLastPage = pageNumber === pageCount - 1;





    const handleFormSubmit = () => {

        if (isEditing) {
            handleUpdateCustomer();
            window.location.reload(true);
        } else {
            handleAddCustomer();
            window.location.reload(true);
        }
    };

    // Function to handle logout
    const handleLogout = () => {
        // Remove the token from local storage
        localStorage.removeItem('token');

        // Redirect to the login page or any other desired location
        router.push('/login');
    };




    return (
        <div>
            {role === 'admin' && (
                <div>
                    {isLoading ? ( // Display loading indicator if isLoading is true
                        <div className="flex justify-center items-center h-screen">
                            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div>
                            <div className='bg-[#F4F4F4] text-black md:h-[22vh] h-[40vh] border-b border-gray-400 shadow-lg'>
                                <div className='md:flex'>
                                    <div className='md:w-1/6'>
                                        <Image
                                            src={jlc}
                                            width={150}
                                            height={200}
                                            className='absolute md:ml-6 md:w-52 w-24 ml-36 top-2'
                                            alt="Logo"
                                        />
                                    </div>
                                    <div className='md:w-5/6 md:flex '>
                                        <div className='w-4/6 text-center md:ml-40 ml-16 pt-5'>
                                            <div className='md:text-5xl text-lg font-bold font-serif md:pt-0 pt-20'>
                                                JAI LIME & CHEMICAL
                                            </div>
                                            <div>
                                                H-1, 503, Road No 15, Bhamashah Ind. Area, Kaladwas, Udaipur
                                            </div>
                                            <div>
                                                Mo. : 99508 35585, 85296 22695
                                            </div>
                                            <div>
                                                GST No. 08ADVPJ9429L1ZL &nbsp; &nbsp; Email: jailime79@gmail.com
                                            </div>
                                        </div>
                                        <div className='w-2/6 '>
                                            <button
                                                onClick={handleLogout}
                                                className="logout-button bg-[#494949] text-white p-3 md:ml-40 ml-44 md:mt-10 mt-4 md:w-20 md:h-20 w-18 h-18 rounded-full flex flex-col items-center justify-center text-center"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <HiOutlineLogout className='md:w-6 md:h-6 w-6 h-6' />
                                                </div>
                                                <div className='md:text-lg text-sm'>
                                                    Logout
                                                </div>
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col mt-4 md:flex-row'>
                                <div className='md:w-1/2 w-full'>
                                    <h3 className="text-gray-800 text-xl sm:text-3xl ml-10 sm:ml-8 mt-4">
                                        <div>Welcome {userid},</div>
                                    </h3>
                                    <div className="mt-4 ml-10 sm:ml-8 w-[75%] md:w-[55%] flex border-black border-2 rounded-full p-1" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} onClick={handleSearchClick}>
                                        <input
                                            type="text"
                                            placeholder="Search by S.NO. or Customers Name"
                                            value={searchQuery}
                                            onChange={event => setSearchQuery(event.target.value)}
                                            onClick={handleSearchClick}
                                            className="rounded-full w-full print:hidden outline-none"
                                        />
                                        <div className='bg-[#FF9211] rounded-full w-8 h-8 mr-1 p-2'>
                                            <HiMagnifyingGlass className='w-4 h-4' />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 mt-4">
                                    <div className="flex flex-col md:flex-row justify-center md:justify-start">
                                        <div className="w-full md:w-1/2">
                                            <div className="text-center border-2 border-gray-400 w-80 md:w-64 rounded-xl shadow-xl p-4 md:ml-60 ml-10">
                                                <h2 className="text-xl font-semibold mb-2">Total Pending Balances</h2>
                                                <div className="text-2xl font-bold italic">INR {calculateTotalBalance(customerData)}/-</div>
                                            </div>
                                        </div>
                                        <div className="md:w-1/2 md:flex-col md:ml-0 ml-24">
                                            <div>
                                                <button
                                                    onClick={handleAddDataClick}
                                                    className="flex bg-[#1B998B] text-white px-4 py-2 rounded-full mt-4 md:mt-0 ml-4 md:ml-40 print:hidden shadow-sm shadow-[#1B998B]"
                                                >
                                                    Add Customer <AiOutlineUserAdd className='w-6 h-6 ml-2' />
                                                </button>
                                            </div>
                                            <div className="mt-4 md:mt-2">
                                                <button
                                                    onClick={handlePrint}
                                                    className="flex bg-[#FF7A00D9] text-white px-4 py-2 rounded-full ml-4 md:ml-40 print:hidden shadow-sm shadow-[#FF7A00D9]"
                                                >
                                                    Print Table <BsPrinter className='w-6 h-6 ml-9' />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="pb-10 w-full px-4 md:px-8">
                                <div className="mt-10 shadow-sm border rounded-lg overflow-x-auto">
                                    <table className="w-full table-auto text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                            <tr>
                                                <th className="py-3 px-6">S. NO.</th>
                                                <th className="py-3 px-6">Customers Name</th>
                                                <th className="py-3 px-6">Contact No.</th>
                                                <th className="py-3 px-6 print:hidden">View Data</th>
                                                <th className="py-3 px-6">Last Entry Date</th>
                                                <th className="py-3 px-6">Balance</th>
                                                <th className="py-3 px-6 print:hidden"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-600 divide-y">
                                            {displayedCustomers.map((item, _id) => (
                                                <tr key={_id} className="divide-x">
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold">{item.customerid}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold">{item.customername}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold">{item.phoneno}</td>

                                                    <td className="px-6 py-4 whitespace-nowrap print:hidden font-bold">
                                                        <button
                                                            onClick={() => handleViewData(item.customerid)}
                                                            className="px-4 py-2 text-white bg-green-600 rounded-lg duration-150 hover:bg-green-700 active:shadow-lg"
                                                        >
                                                            View Data
                                                        </button>

                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                                                        {item.data.length > 0 ? item.data[item.data.length - 1].salesdate : ''}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold">{calculateBalanceForCustomer(item)}</td>



                                                    <td className="text-right px-6 whitespace-nowrap print:hidden">
                                                        {isEditing && editingIndex && editingIndex.pageIndex === pageNumber && editingIndex.indexWithinPage === _id ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    name="customername"
                                                                    placeholder='Customer Name'
                                                                    value={newData.customername}
                                                                    onChange={handleFormChange}
                                                                    className="border p-2 rounded-md"
                                                                />
                                                                <input
                                                                    type="tel"
                                                                    name="phoneno"
                                                                    placeholder='Phone No'
                                                                    value={newData.phoneno}
                                                                    onChange={handleFormChange}
                                                                    className="border p-2 rounded-md"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    name="initialbalance"
                                                                    placeholder='Opening Balance'
                                                                    value={newData.initialbalance}
                                                                    onChange={handleFormChange}
                                                                    className="border p-2 rounded-md"
                                                                />
                                                                <button
                                                                    onClick={handleSaveChanges} // Use the handler directly here
                                                                    className="py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setIsEditing(false);
                                                                        setEditingIndex(null);
                                                                        setNewData({
                                                                            customerid: '',
                                                                            customername: '',
                                                                            phoneno: '',
                                                                            phoneno2: '',
                                                                            initialbalance: '',
                                                                        });
                                                                    }}
                                                                    className="ml-2 text-gray-600 hover:text-gray-800"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditClick(pageNumber, _id)}
                                                                    className="print:hidden py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    onClick={() => handleDeleteClick(item.customerid)}
                                                                    className="print:hidden py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 print:hidden">
                                    <button
                                        onClick={goToFirstPage}
                                        className="mr-2 px-2 py-1 border rounded border-gray-300 hover:bg-blue-500 hover:text-white"
                                    >
                                        First Page
                                    </button>
                                    <button
                                        onClick={goToLastPage}
                                        className="ml-2 px-2 py-1 border rounded border-gray-300 hover:bg-blue-500 hover:text-white"
                                    >
                                        Last Page
                                    </button>
                                    <ReactPaginate
                                        previousLabel={'Previous'}
                                        nextLabel={'Next'}
                                        breakLabel={'...'}
                                        pageCount={pageCount}
                                        marginPagesDisplayed={2}
                                        pageRangeDisplayed={5}
                                        onPageChange={handlePageClick}
                                        containerClassName={'flex justify-center mt-4'}
                                        pageClassName={'mx-2'}
                                        activeClassName={'bg-blue-500 border rounded p-2 text-white'}
                                        previousClassName={'px-2 py-1 border rounded border-gray-300'}
                                        nextClassName={'px-2 py-1 border rounded border-gray-300'}
                                        forcePage={pageNumber} // Set the current page from state
                                    />

                                </div>

                            </div>

                            {isAddingData && (
                                <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                                    <div className="bg-white p-6 rounded-lg">
                                        <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
                                        <form onSubmit={handleFormSubmit}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    name="customername"
                                                    placeholder="Customers Name"
                                                    value={newData.customername} // Corrected value attribute
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md"
                                                />
                                                <input
                                                    type="tel"
                                                    name="phoneno"
                                                    placeholder="Contact No."
                                                    value={newData.phoneno} // Corrected value attribute
                                                    onChange={handleFormChange}
                                                    className="ml-2 border p-2 rounded-md"
                                                />
                                                <input
                                                    type="tel"
                                                    name="initialbalance"
                                                    placeholder="Opening Balance"
                                                    value={newData.initialbalance} // Corrected value attribute
                                                    onChange={handleFormChange}
                                                    className="ml-2 border p-2 rounded-md"
                                                />
                                            </div>
                                            <div className="flex mt-4">
                                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
                                                    Add
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingData(false)}
                                                    className="ml-2 text-gray-600 hover:text-gray-800"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>)}

                    <div className="mt-10 py-4 border-t md:text-center">
                        <p>© 2023  Jai Lime & Chemical. All rights reserved.</p>
                    </div>
                </div>
            )}
            {role === 'user' && (
                <div>
                    <h1>ERROR - Please Reload</h1>
                </div>
            )}
        </div>
    );
};


export default Customers;
