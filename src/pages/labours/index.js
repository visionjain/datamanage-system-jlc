import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { useAuth } from '../../components/Customers/useAuth'
import LogoutButton from "../../components/Customers/LogoutButton";


const Labours = ({ labour }) => {
    useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [labourData, setLabourData] = useState([]);
    const [isAddingData, setIsAddingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLabourData = labourData.labour
        ? labourData.labour.filter((labour) =>
           labour.labourid.includes(searchQuery) ||
            labour.labourname.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/getlabour');
                setLabourData(response.data);
                setIsLoading(false); // Turn off loading state after data fetch
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false); // Turn off loading state on error as well
            }
        };
        fetchData();
    }, []);




    const reassignLabourIds = (newLabourData) => {
        newLabourData.forEach((labour, index) => {
            labour.labourid = (index + 1).toString();
        });
    };
    const handleSearchClick = () => {
        setPageNumber(0);
    };

    const handleEditClick = (pageIndex, indexWithinPage) => {
        setIsEditing(true);
        setEditingIndex({ pageIndex, indexWithinPage }); // Store both page index and index within page
        const labourToEdit = displayedLabours[indexWithinPage]; // Access data from the displayedCustomers array
        setNewData({
            labourid: labourToEdit.labourid,
            labourname: labourToEdit.labourname
        });
    };
    const savedPageNumber = typeof window !== 'undefined' ? localStorage.getItem('currentPageNumber') : null;
    const [pageNumber, setPageNumber] = useState(savedPageNumber ? parseInt(savedPageNumber) : 0);

    // Number of customers to display per page
    const laboursPerPage = 10;

    // Calculate the offset based on the page number
    const offset = pageNumber * laboursPerPage;

    // Slice the customer data to display only the current page
    const displayedLabours = filteredLabourData.slice(offset, offset + laboursPerPage);

    // Calculate the total number of pages
    const pageCount = Math.ceil(filteredLabourData.length / laboursPerPage);

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

    const handleDeleteClick = async (labourid) => {
        const shouldDelete = window.confirm("Are you sure you want to delete this customer?");
        if (!shouldDelete) {
            return; // If user cancels deletion, do nothing
        }

        try {
            await axios.delete(`/api/deletelabour?labourid=${labourid}`);

            // Update customerData state after successful deletion
            const updatedLabourData = labourData.labour.filter(labour => labour.labourid !== labourid);
            reassignLabourIds(updatedLabourData); // Reassign customer IDs
            setLabourData({ labour: updatedLabourData });

            // Call the updateCustomerIds API to reassign customer IDs in the database
            await axios.post('/api/updateLabourIds');
            window.location.reload(true);
        } catch (error) {
            console.error("Error deleting Labour:", error);
        }
    };







    const [newData, setNewData] = useState({
        labourid: '',
        labourname: '',
    });




    const handleAddDataClick = () => {
        setIsAddingData(true);
        setNewData({
            labourid: '',
            labourname: '',
        });
        setEditingIndex(null);
    };


    const handleViewData = (labourid) => {
        // Navigate to the DetailPage with the corresponding customerid
        window.location.href = `/labours/${labourid}`;
    };




    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddLabour = async () => {
        try {
            // Construct the new customer data
            const newLabourData = {
                labourid: (labourData.labour.length + 1).toString(), // Generate a new customer id
                labourname: newData.labourname,
                data: [] // Initialize with an empty array for other data
            };

            const response = await axios.post('/api/addlabour', [newLabourData]);

            // Update customerData state after successful add
            fetchData();
            setIsAddingData(false);
            setNewData({
                labourid: '',
                labourname: '',
            });
            setTimeout(() => {
                window.location.reload(true);
            }, 1500);

        } catch (error) {
            console.error("Error adding labour:", error);
        }
    };

    const handleUpdateLabour = async () => {
        try {

            const response = await axios.put(
                `/api/updatelabour?labourid=${newData.labourid}`,
                newData
            );

            // Update customerData state after successful update
            fetchData();
            setIsEditing(false);
            setEditingIndex(null);
            setNewData({
                labourid: '',
                labourname: '',
            });
            window.location.reload(true);
        } catch (error) {
            console.error("Error updating labour:", error);
        }
    };
    const handleSaveChanges = async () => {
        try {
            const shouldSubmit = window.confirm("Are you sure you want to save the changes?");
            if (!shouldSubmit) {
                return; // User canceled submission
            }

            await handleUpdateLabour(); // Call the update handler

            // Close the edit block and reset new data
            setIsEditing(false);
            setEditingIndex(null);
            setNewData({
                labourid: '',
                labourname: '',
            });

            // Fetch the data again to reflect changes
            // fetchData();
            window.location.reload(true);
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    };


    const handleFormSubmit = () => {

        if (isEditing) {
            handleUpdateLabour();
            window.location.reload(true);
        } else {
            handleAddLabour();
            window.location.reload(true);
        }
    };

    const calculateBalanceForLabour = (labour) => {
        let balance = 0;
    
        // Iterate through the labour's data and calculate the balance
        for (const item of labour.data) {
            const amount = parseFloat(item.amount) || 0;
            const cashrec = parseFloat(item.cashrec) || 0;
            const gas = parseFloat(item.gas) || 0;
            balance += amount - gas - cashrec;
        }
    
        // If the balance is negative, return it with "ADV", otherwise, return as is
        return balance < 0 ? `${Math.abs(balance)} ADV` : balance;
    };
    





    return (
        <div>
            {isLoading ? ( // Display loading indicator if isLoading is true
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-blue-500"></div>
                </div>
            ) : (
                <div className='pt-10 pb-10'>

                    <div className="w-full px-4 md:px-8">
                        <div className="items-start justify-between md:flex">
                            <div className="max-w-lg">
                                <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
                                    All Labours
                                </h3>
                            </div>
                            <div className="mt-3 md:mt-0">
                                <a
                                    className="cursor-pointer inline-block px-4 py-2 text-white duration-150 font-medium bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 md:text-sm"
                                    onClick={handleAddDataClick}
                                >
                                    Add Labour
                                </a>
                                <LogoutButton/>
                            </div>
                        </div>
                        <table className="border-2 border-black mx-auto">
                            <tbody>
                                <tr>
                                    <td className="border-2 border-black p-6 px-40 text-center">
                                        <div className='text-5xl font-bold font-serif'>
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
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="mt-10">
                            <input
                                type="text"
                                placeholder="Search by S.NO. or Labours Name"
                                value={searchQuery}
                                onChange={event => setSearchQuery(event.target.value)}
                                onClick={handleSearchClick} // Add this line
                                className="border p-2 rounded-md w-full"
                            />
                        </div>
                        <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
                            <table className="w-full table-auto text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                    <tr>
                                        <th className="py-3 px-6">S. NO.</th>
                                        <th className="py-3 px-6">Labour Name</th>
                                        <th className="py-3 px-6">View Data</th>
                                        <th className="py-3 px-6">Last Entry Date</th>
                                        <th className="py-3 px-6">Balance</th>
                                        <th className="py-3 px-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 divide-y">
                                    {displayedLabours.map((item, _id) => (
                                        <tr key={_id} className="divide-x">
                                            <td className="px-6 py-4 whitespace-nowrap">{item.labourid}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.labourname}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewData(item.labourid)}
                                                    className="px-4 py-2 text-white bg-green-600 rounded-lg duration-150 hover:bg-green-700 active:shadow-lg"
                                                >
                                                    View Data
                                                </button>

                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.data.length > 0 ? item.data[item.data.length - 1].date : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{calculateBalanceForLabour(item)}</td>
                                            <td className="text-right px-6 whitespace-nowrap">
                                                {isEditing && editingIndex && editingIndex.pageIndex === pageNumber && editingIndex.indexWithinPage === _id ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            name="labourname"
                                                            value={newData.labourname}
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
                                                                    labourid: '',
                                                                   labourname: '',
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
                                                            className="py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteClick(item.labourid)}
                                                            className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg"
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
                        <div className="mt-4">
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
                                <h2 className="text-xl font-semibold mb-4">Add New Labour</h2>
                                <form onSubmit={handleFormSubmit}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="labourname"
                                            placeholder="Labour Name"
                                            value={newData.labourname} // Corrected value attribute
                                            onChange={handleFormChange}
                                            className="border p-2 rounded-md"
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
    );
};


export default Labours;