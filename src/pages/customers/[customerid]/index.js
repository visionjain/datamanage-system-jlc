import React, { useState, useEffect, useRef } from 'react';
import { calculateDRAndBalance } from '../../../components/landing/calculateDRAndBalance';
import { useRouter } from 'next/router';
import ExcelGenerator from '../../../components/landing/ExcelGenerator';
import axios from 'axios';
import Image from 'next/image';
import jlc from '../../../../public/logojlc.png';
import { useAuth } from '../../../components/Customers/useAuth';
import LogoutButton from "../../../components/Customers/LogoutButton";
import jwt from 'jsonwebtoken';
import { format, parse, isWithinInterval } from 'date-fns';
import { BsFillArrowUpSquareFill, BsCloudDownload, BsPrinter, BsFileEarmarkExcel } from 'react-icons/bs';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';




const Landing = () => {
    useAuth();
    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredData, setFilteredData] = useState(null);


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



    const router = useRouter();
    const customerid = router.query.customerid;


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/getcustomer');
                const allCustomerData = response.data.customer;

                // Find the customer that matches the current customer ID (slug)
                const matchingCustomer = allCustomerData.find(customer => customer.customerid === customerid);

                if (matchingCustomer) {
                    setCustomer(matchingCustomer); // Set the matching customer object
                    setIsLoading(false); // Turn off loading state after data fetch
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [customerid]);


    const [initialBalance, setInitialBalance] = useState(0);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/getcustomer');
                const allCustomerData = response.data.customer;

                // Find the customer that matches the current customer ID (slug)
                const matchingCustomer = allCustomerData.find(customer => customer.customerid === customerid);

                if (matchingCustomer) {
                    // Check if the customer object has an initialbalance property and parse it to a float
                    const customerInitialBalance = parseFloat(matchingCustomer.initialbalance || 0);
                    setInitialBalance(customerInitialBalance);

                    setCustomer(matchingCustomer); // Set the matching customer object
                    setIsLoading(false); // Turn off loading state after data fetch
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [customerid]);








    const handlePrint = () => {
        window.print();
    };


    const [initialCalculationDone, setInitialCalculationDone] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showOnlyNonZeroDR, setShowOnlyNonZeroDR] = useState(true);
    const [showOnlyNonZeroCR, setShowOnlyNonZeroCR] = useState(true);



    const filteredTableItems = customer && customer.data
        ? customer.data.filter(item =>
            item.numberid.includes(searchQuery) ||
            item.salesdate.includes(searchQuery) ||
            item.drivername.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    useEffect(() => {
        // Parse the date strings into date objects when customer data is available
        if (customer && customer.data) {
            const parsedData = customer.data.map((item) => {
                return {
                    ...item,
                    salesdate: item.salesdate ? parse(item.salesdate, 'dd/MM/yy', new Date()) : null,
                };
            });
            // Set the parsed data to the filtered data
            setFilteredData(parsedData);
        }
    }, [customer]);
    const applyDateRangeFilter = () => {
        if (startDate && endDate) {
            const start = parse(startDate, 'dd/MM/yy', new Date());
            const end = parse(endDate, 'dd/MM/yy', new Date());

            // Filter the data based on the date range
            const filtered = filteredData.filter((item) => {
                return isWithinInterval(item.salesdate, { start, end });
            });

            setFilteredData(filtered);
        } else {
            setFilteredData(null); // Clear the filter
        }
    };



    const prevCustomerDataRef = useRef();
    useEffect(() => {
        const calculateDRAndBalance = (data, previousBalance) => {
            const totalProductAmount =
                (valueToNumber(data.Limea) * valueToNumber(data.LimeaPrice)) +
                (valueToNumber(data.Limew) * valueToNumber(data.LimewPrice)) +
                (valueToNumber(data.Limeb) * valueToNumber(data.LimebPrice)) +
                (valueToNumber(data.Limeoffw) * valueToNumber(data.LimeoffwPrice)) +
                (valueToNumber(data.jhiki) * valueToNumber(data.jhikiPrice)) +
                (valueToNumber(data.rs) * valueToNumber(data.rsPrice));

            const dr = (totalProductAmount + valueToNumber(data.autocharge) + valueToNumber(data.labourcharge) + valueToNumber(data.extracharge));

            // Round the dr value based on your criteria (0.00 to 0.49 down to 0 and 0.50 to 0.99 up to 1)
            const roundedDR = customRound(dr);

            const cr = valueToNumber(data.cr) || 0;
            const balance = (previousBalance + valueToNumber(roundedDR) - valueToNumber(cr)).toFixed(2);

            return { dr: roundedDR, balance };
        };

        // Custom rounding function
        const customRound = (value) => {
            const decimalPart = value - Math.floor(value); // Get the decimal part
            if (decimalPart >= 0.5) {
                return Math.ceil(value); // Round up if decimal is 0.50 to 0.99
            } else {
                return Math.floor(value); // Round down if decimal is 0.00 to 0.49
            }
        };




        if (customer && customer.data) {
            let previousBalance = initialBalance;

            const updatedItemsWithBalance = customer.data.map(item => {
                const { dr, balance } = calculateDRAndBalance(item, previousBalance);
                previousBalance = parseFloat(balance);

                return {
                    ...item,
                    dr,
                    balance,
                };
            });

            // Only update the state if the customer data has changed
            if (JSON.stringify(customer.data) !== JSON.stringify(prevCustomerDataRef.current)) {
                setCustomer(prevCustomer => ({
                    ...prevCustomer,
                    data: updatedItemsWithBalance,
                }));

                prevCustomerDataRef.current = customer.data; // Update the ref
            }

            setInitialCalculationDone(true);
        }
    }, [customer, initialBalance]);


    const [isAddingData, setIsAddingData] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const handleEditClick = (index, _id) => {
        setEditingIndex(index);
        // Find the row to edit based on _id and set it as newData
        const rowToEdit = customer.data.find(item => item._id === _id);
        setNewData(rowToEdit || {});
        setIsAddingData(true);
    };


    const handleDRArrowClick = () => {
        setShowOnlyNonZeroDR(!showOnlyNonZeroDR);

        // Add the code to filter the table based on showOnlyNonZeroDR
        const updatedTableItems = customer.data.filter(item =>
            (!showOnlyNonZeroDR || parseFloat(item.dr) !== 0) && // Apply the filter
            (item.numberid.includes(searchQuery) ||
                item.salesdate.includes(searchQuery) ||
                item.drivername.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredData(updatedTableItems);
    };

    const handleCRArrowClick = () => {
        setShowOnlyNonZeroCR(!showOnlyNonZeroCR);

        // Add the code to filter the table based on showOnlyNonZeroDR
        const updatedTableItems = customer.data.filter(item =>
            (!showOnlyNonZeroCR || parseFloat(item.cr) !== 0) && // Apply the filter
            (item.numberid.includes(searchQuery) ||
                item.salesdate.includes(searchQuery) ||
                item.drivername.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        setFilteredData(updatedTableItems);
    };


    const handleDeleteClick = async (index, _id) => {
        const shouldDelete = window.confirm("Are you sure you want to delete this item?");
        if (shouldDelete) {
            try {
                await axios.delete(`/api/deleteitem?customerid=${customer.customerid}&_id=${_id}`);

                // Update the local state after successful deletion
                const updatedTableItems = customer.data.filter((item, idx) => idx !== index);
                setCustomer(prevCustomer => ({
                    ...prevCustomer,
                    data: updatedTableItems,
                }));
                window.location.reload(true);
            } catch (error) {
                console.error('Error deleting data entry:', error);
            }
        }
    };






    const [newData, setNewData] = useState({
        numberid: '',
        salesdate: '',
        drivername: '',
        autono: '',
        km: '',
        Limea: '',
        LimeaPrice: '',
        Limew: '',
        LimewPrice: '',
        Limeb: '',
        LimebPrice: '',
        Limeoffw: '',
        LimeoffwPrice: '',
        jhiki: '',
        jhikiPrice: '',
        rs: '',
        rsPrice: '',
        siteaddress: '',
        labourcharge: '',
        autocharge: '',
        extracharge: '',
        amount: '',
        dr: '',
        cr: '',
        balance: '',
    });



    const handleAddDataClick = () => {
        setIsAddingData(true);
        setEditingIndex(null); // Clear editing index when adding new data
    };



    const handleFormChange = (event) => {
        const { name, value } = event.target;

        let updatedNewData = { ...newData };
        updatedNewData[name] = value;
        // updatedNewData.cr = updatedNewData.cr || '0.00';

        const products = ["Limea", "LimeaPrice", "Limew", "LimewPrice", "Limeb", "LimebPrice", "Limeoffw", "LimeoffwPrice", "jhiki", "jhikiPrice", "rs", "rsPrice"];
        let totalAmount = 0;

        products.forEach((product, index) => {
            const valueName = product;
            const priceName = product + "Price";

            const productValue = valueToNumber(updatedNewData[valueName]);
            const productPrice = valueToNumber(updatedNewData[priceName]);
            if (!isNaN(productValue) && !isNaN(productPrice)) {
                const totalProductAmount =
                    (valueToNumber(updatedNewData.Limea) * valueToNumber(updatedNewData.LimeaPrice)) +
                    (valueToNumber(updatedNewData.Limew) * valueToNumber(updatedNewData.LimewPrice)) +
                    (valueToNumber(updatedNewData.Limeb) * valueToNumber(updatedNewData.LimebPrice)) +
                    (valueToNumber(updatedNewData.jhiki) * valueToNumber(updatedNewData.jhikiPrice)) +
                    (valueToNumber(updatedNewData.Limeoffw) * valueToNumber(updatedNewData.LimeoffwPrice)) +
                    (valueToNumber(updatedNewData.rs) * valueToNumber(updatedNewData.rsPrice));
                updatedNewData.dr = (totalProductAmount + valueToNumber(updatedNewData.autocharge) + valueToNumber(updatedNewData.labourcharge) + valueToNumber(updatedNewData.extracharge)).toFixed(2);
                totalAmount += productValue * productPrice;
            }
            if (index === products.length - 1) {
                updatedNewData.amount = totalAmount.toFixed(2);
            }
        });

        setNewData(updatedNewData);
    };


    const valueToNumber = (value) => {

        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? 0 : numericValue;
    };




    const handleFormSubmit = async (event) => {
        event.preventDefault();

        // Calculate DR and balance for the new data
        const { dr, balance } = calculateDRAndBalance(newData, initialBalance);
        newData.dr = dr;
        newData.balance = balance;
        newData.cr = newData.cr === "" ? "0" : newData.cr;

        try {
            if (editingIndex !== null) {
                // Update existing data when in edit mode
                const updatedTableItems = customer.data.map((item, index) =>
                    index === editingIndex ? newData : item
                );

                // Send a PUT request to update the item
                await axios.put(`/api/updateitem?customerid=${customer.customerid}`, newData);

                setCustomer((prevCustomer) => ({
                    ...prevCustomer,
                    data: updatedTableItems,
                }));
            } else {
                // Send a POST request to add the new data
                await axios.post(`/api/additem?customerid=${customer.customerid}`, newData);

                // Update local state with the new data
                const updatedTableItems = [...customer.data, newData];
                setCustomer((prevCustomer) => ({
                    ...prevCustomer,
                    data: updatedTableItems,
                }));
            }

            // Reset form and state
            setNewData({
                numberid: "",
                salesdate: "",
                drivername: "",
                autono: "",
                km: '',
                Limea: "",
                Limew: "",
                Limeb: "",
                Limeoffw: '',
                LimeoffwPrice: '',
                jhiki: "",
                rs: "",
                siteaddress: "",
                labourcharge: "",
                autocharge: "",
                extracharge: '',
                amount: "",
                dr: "",
                cr: "",
                balance: "",
            });
            setIsAddingData(false);
            setEditingIndex(null);
            window.location.reload(true);
        } catch (error) {
            console.error('Error adding data entry:', error);
        }
    };
    const handleViewData = (customerid, _id) => {
        // Navigate to the DetailPage with the corresponding customerid
        window.location.href = `/customers/${customerid}/bill/${_id}`;
    };




    useEffect(() => {
        if (customer && customer.data && !initialCalculationDone) {
            let previousBalance = 0;

            const updatedItemsWithBalance = customer.data.map(item => {
                const { dr, balance } = calculateDRAndBalance(item, previousBalance);
                previousBalance = parseFloat(balance);

                return {
                    ...item,
                    dr,
                    balance,
                };
            });

            setCustomer(prevCustomer => ({
                ...prevCustomer,
                data: updatedItemsWithBalance,
            }));

            setInitialCalculationDone(true);
        }
    }, [customer, initialCalculationDone]);


    //pagiantion
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;


    // Check if filteredData is not null before applying slice
    const paginatedFilteredData = customer && customer.data && filteredData
        ? filteredData.slice(startIndex, endIndex)
        : [];

    const nextPage = () => {
        if (currentPage < Math.ceil(filteredTableItems.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    const totalPages = Math.ceil(filteredTableItems.length / itemsPerPage);
    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    const goToLastPage = () => {
        setCurrentPage(totalPages);
    };

    useEffect(() => {
        // Check if localStorage is available in the browser environment
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedPage = parseInt(localStorage.getItem('currentPage')) || 1;
            setCurrentPage(savedPage);
        }
    }, []);
    useEffect(() => {
        // Check if localStorage is available in the browser environment
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('currentPage', currentPage);
        }
    }, [currentPage]);



    // Function to format a decimal number with commas as thousands separators and two decimal places
    function formatDecimalWithCommasAndDecimals(number) {
        return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(number);
    }

    const lastRowBalance = customer && customer.data && customer.data.length > 0
        ? parseFloat(customer.data[customer.data.length - 1]?.balance || 0)
        : 0; // Default to 0 if data is empty

    // Format the last row's balance with commas using toLocaleString
    const formattedLastRowBalance = lastRowBalance.toLocaleString('en-IN');

    const clearFilter = () => {
        // Clear the date filter by setting startDate and endDate to empty strings
        setStartDate('');
        setEndDate('');

        // Reload the web page
        window.location.reload();
    };



    const drArrowClass = showOnlyNonZeroDR ? 'cursor-pointer' : 'cursor-pointer text-indigo-600';
    const crArrowClass = showOnlyNonZeroCR ? 'cursor-pointer' : 'cursor-pointer text-indigo-600';
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleDownloadClick = () => {
        setIsDropdownOpen(!isDropdownOpen); // Toggle the dropdown's visibility
    };

    const handlePrintClick = () => {
        setIsDropdownOpen(false); // Close the dropdown
        handlePrint(); // Call your print function here
    };

    const handleExcelGeneratorClick = () => {
        setIsDropdownOpen(false);
    };




    const calculateTotalDR = () => {
        if (customer && customer.data) {
            const totalDR = customer.data.reduce((accumulator, item) => {
                return accumulator + parseFloat(item.dr || 0);
            }, 0);
            return totalDR;
        }
        return 0;
    };

    const calculateTotalCR = () => {
        if (customer && customer.data) {
            const totalCR = customer.data.reduce((accumulator, item) => {
                return accumulator + parseFloat(item.cr || 0);
            }, 0);
            return totalCR;
        }
        return 0;
    };

    const totalDR = calculateTotalDR();
    const totalCR = calculateTotalCR();


    // ... (your existing code)

    const handleItemsPerPageChange = (event) => {
        const newValue = parseInt(event.target.value);
        setItemsPerPage(newValue);
    };



    if (!customer) {
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-blue-500"></div>
        </div>
    } else {
        return (
            <div>
                {role === 'admin' && (
                    <div className='pt-10'>
                        <div className="w-full px-4 md:px-8">
                            <div className="items-start justify-between md:flex">
                                <div className='md:pb-0 pb-16'>
                                    <Image
                                        src={jlc}
                                        width={150}
                                        height={200}
                                        className='absolute md:ml-6 md:w-52 w-24 ml-36 top-5'
                                        alt="Logo"
                                    />
                                </div>
                                <div className="mt-3 mb-3 md:mt-0 print:hidden">
                                    <a
                                        className="cursor-pointer inline-block px-4 py-2 text-white duration-150 font-medium bg-indigo-600 rounded-lg hover-bg-indigo-500 active-bg-indigo-700 md-text-sm"
                                        onClick={handleAddDataClick}
                                    >
                                        Add Data
                                    </a>
                                    <div className="relative inline-block text-left ml-10 md:pb-0 pb-2">
                                        <button
                                            className="flex cursor-pointer px-7 py-2 text-white duration-150 font-medium bg-indigo-600 rounded-lg hover-bg-indigo-500 active-bg-indigo-700 md-text-sm"
                                            onClick={handleDownloadClick}
                                        >
                                            Download <BsCloudDownload className='w-5 h-5 ml-2 mt-1' />
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="origin-top-right absolute w-40 rounded-md shadow-lg bg-gray-200 focus-outline-none" tabindex-1>
                                                <div className="py-1" role-menuitem tabindex-0>
                                                    <button
                                                        onClick={handlePrintClick}
                                                        className=" flex px-4 py-2 text-black font-bold border-2 border-black bg-orange-400 hover-bg-gray-100 w-full text-left"
                                                    >
                                                        Print Table <BsPrinter className='w-5 h-5 ml-2 mt-1' />
                                                    </button>
                                                </div>
                                                <div className="py-1" role-menuitem tabindex-0 onClick={handleExcelGeneratorClick}>
                                                    <ExcelGenerator tableItems={customer.data} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <LogoutButton />
                                </div>
                            </div>
                            <table className="border-2 border-black mx-auto">
                                <tbody>
                                    <tr>
                                        <td className="border-2 border-black md:p-6 p-0 md:px-40 text-center ">
                                            <div className='md:text-6xl text-5xl font-bold font-serif'>
                                                JAI LIME & CHEMICAL
                                            </div>
                                            <div className='md:text-xl text-lg'>
                                                H-1, 503, Road No 15, Bhamashah Ind. Area, Kaladwas, Udaipur
                                            </div>
                                            <div className='md:text-xl text-lg'>
                                                Mo. : 99508 35585, 85296 22695
                                            </div>
                                            <div className='md:text-xl text-lg'>
                                                GST No. 08ADVPJ9429L1ZL &nbsp; &nbsp; Email: jailime79@gmail.com
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="max-w-lg mt-10">
                                <h3 className="text-gray-800 text-xl font-bold sm:text-4xl mb-4">
                                    {customer.customername}&apos;s खाता
                                </h3>
                            </div>
                            <div className="mt-10 print:hidden">
                                <input
                                    type="text"
                                    placeholder="Search by S.NO. / Driver Name / Date"
                                    value={searchQuery}
                                    onChange={event => setSearchQuery(event.target.value)}
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="mt-2 font-medium print:hidden">
                                Old Due Balance: {initialBalance.toLocaleString('en-IN')} &nbsp;&nbsp;&nbsp; Total DR: {totalDR.toLocaleString('en-IN')} &nbsp;&nbsp;&nbsp; Total CR: {totalCR.toLocaleString('en-IN')}
                            </div>
                            <div className=' mt-4 p-4 border rounded-lg print:hidden'>
                                <label className="mr-4 text-lg">Start Date:</label>
                                <input
                                    type="text"
                                    style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '6px' }}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    placeholder='dd/mm/yy'
                                />
                                <label className="ml-4 mr-4 text-lg">End Date:</label>
                                <input
                                    type="text"
                                    style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '6px' }}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    placeholder='dd/mm/yy'
                                />

                                <button
                                    onClick={applyDateRangeFilter}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md ml-8"
                                >
                                    Apply Filter
                                </button>
                                <button
                                    onClick={clearFilter}
                                    className="bg-red-500 hover.bg-red-700 text-white font-bold py-2 px-4 rounded-md ml-4"
                                >
                                    Clear Filter
                                </button>
                                <div className="ml-10 font-medium print:hidden">
                                    <label htmlFor="itemsPerPage">Rows per page:</label>
                                    <select
                                        id="itemsPerPage"
                                        name="itemsPerPage"
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="ml-2 bg-white border border-gray-300 rounded-md px-2 py-1"
                                    >
                                        <option value={15}>15</option>
                                        <option value={30}>30</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value={customer.data ? customer.data.length : 0}>All</option>
                                    </select>
                                </div>
                            </div>



                            <div className="mt-4 shadow-sm border rounded-lg overflow-x-auto mb-10">
                                <table className="w-full table-auto text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                        <tr className='divide-x'>
                                            <th className="py-3 px-2 md:text-2xl print:hidden">NO.</th>
                                            <th className="py-3 px-2 md:text-2xl">S. NO.</th>
                                            <th className="py-3 px-6 md:text-2xl">Sales Date</th>
                                            <th className="py-3 px-2 md:text-2xl">Driver Name</th>
                                            <th className="py-3 px-6 md:text-2xl">Auto No.</th>
                                            <th className="py-3 px-6 md:text-2xl">Lime (A)</th>
                                            <th className="py-3 px-6 md:text-2xl">Lime (W)</th>
                                            <th className="py-3 px-6 md:text-2xl">Lime (B)</th>
                                            <th className="py-3 px-6 md:text-2xl">Lime (OFF_W)</th>
                                            <th className="py-3 px-6 md:text-2xl">Jhiki (झिकीं)</th>
                                            <th className="py-3 px-6 md:text-2xl">Aaras (आरस)</th>
                                            <th className="py-3 px-6 md:text-2xl">Site Address</th>
                                            <th className="py-3 px-6 md:text-2xl">Amount</th>
                                            <th className="py-3 px-2 md:text-2xl">Labour Charge</th>
                                            <th className="py-3 px-2 md:text-2xl">Auto Charge</th>
                                            <th className="py-3 px-2 md:text-2xl">Extra Charges</th>
                                            <th
                                                className={`py-3 px-6 md:text-2xl ${drArrowClass}`}
                                                onClick={handleDRArrowClick}
                                            >
                                                <div className='flex'>
                                                    DR (बकाया)
                                                    <div className='print:hidden'>
                                                        <BsFillArrowUpSquareFill />
                                                    </div>
                                                </div>
                                            </th>
                                            <th
                                                className={`py-3 px-6 md:text-2xl ${crArrowClass}`}
                                                onClick={handleCRArrowClick}
                                            >
                                                <div className='flex'>
                                                    CR (जमा)
                                                    <div className='print:hidden'>
                                                        <BsFillArrowUpSquareFill />
                                                    </div>
                                                </div>
                                            </th>
                                            <th className="py-3 px-6 md:text-2xl">Balance (शेष)</th>
                                            <th className="py-3 px-6 md:text-2xl print:hidden">Generate Bill</th>
                                            <th className="py-3 px-6 print:hidden "></th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 divide-y">

                                        {customer && customer.data
                                            ? (paginatedFilteredData).map((item, idx) => (
                                                <tr key={idx} className="divide-x">
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-2xl print:hidden">{idx + 1}</td>
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-2xl"> {item.numberid === '' ? '-' : item.numberid}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.salesdate && !isNaN(new Date(item.salesdate).getTime()) ? format(new Date(item.salesdate), 'dd/MM/yy') : '-'}
                                                    </td>

                                                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.drivername === '' ? '-' : item.drivername}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">{item.autono === '' ? '-' : item.autono}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.Limea ? (
                                                            `${item.Limea} X ${item.LimeaPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.Limew ? (
                                                            `${item.Limew} X ${item.LimewPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.Limeb ? (
                                                            `${item.Limeb} X ${item.LimebPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.Limeoffw ? (
                                                            `${item.Limeoffw} X ${item.LimeoffwPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.jhiki ? (
                                                            `${item.jhiki} X ${item.jhikiPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.rs ? (
                                                            `${item.rs} KG X ${item.rsPrice}`
                                                        ) : '-'}
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.siteaddress === '' ? '-' : item.siteaddress}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {isNaN(item.amount) || item.amount === '' ? '0' : parseFloat(item.amount).toFixed(2)}
                                                    </td>


                                                    <td className="px-2 py-4 whitespace-nowrap font-bold text-center md:text-2xl">{item.labourcharge === '' ? '-' : item.labourcharge}</td>
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold text-center md:text-2xl">{item.autocharge === '' ? '-' : item.autocharge}</td>
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold text-center md:text-2xl">{item.extracharge === '' ? '-' : item.extracharge}</td>

                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">{item.dr}</td>
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.cr === '' ? '0' : parseFloat(item.cr).toLocaleString('en-IN')}
                                                    </td>


                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.balance < 0
                                                            ? `${formatDecimalWithCommasAndDecimals(Math.abs(item.balance))} ADV`
                                                            : formatDecimalWithCommasAndDecimals(item.balance)}
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap print:hidden font-bold">
                                                        <button
                                                            onClick={() => handleViewData(customer.customerid, item._id)}
                                                            className="px-4 py-2 text-white bg-green-600 rounded-lg duration-150 hover:bg-green-700 active:shadow-lg font-bold"
                                                        >
                                                            Generate Bill
                                                        </button>
                                                    </td>
                                                    <td className="text-right px-6 whitespace-nowrap print:hidden font-bold ">
                                                        <button
                                                            onClick={() => handleEditClick(idx, item._id)} // Pass both idx and item._id
                                                            className="py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg"
                                                        >
                                                            <FaRegEdit className='w-5 h-5' />
                                                        </button>


                                                        <button
                                                            onClick={() => handleDeleteClick(idx, item._id)} // Call the delete handler with item._id
                                                            className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg"
                                                        >
                                                            <FaRegTrashAlt className='w-5 h-5' />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : null}
                                    </tbody>
                                </table>


                            </div>
                            <div className='md:text-2xl mb-4'>- कृपया निवेदन है कि हिसाब में कोई भी भूल चूक होने पर फोन पर तुरंत सूचित करें ताकि समय पर सुधार हो सके !</div>


                        </div>
                        {isAddingData && (
                            <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                                <div className="bg-white p-4 rounded-xl">
                                    <h2 className="text-xl font-semibold mb-4">Add New Data</h2>
                                    <form onSubmit={handleFormSubmit}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                name="numberid"
                                                placeholder="S. NO."
                                                value={newData.numberid}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                name="salesdate"
                                                placeholder="Sales Date"
                                                value={newData.salesdate}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                name="drivername"
                                                placeholder="Driver Name"
                                                value={newData.drivername}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                name="autono"
                                                placeholder="Auto No."
                                                value={newData.autono}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                name="km"
                                                placeholder="K.M."
                                                value={newData.km}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    name="Limea"
                                                    placeholder="Lime (A)"
                                                    value={newData.Limea}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-20"
                                                />
                                                <span className="text-gray-600 mx-2">x</span>
                                                <input
                                                    type="text"
                                                    name="LimeaPrice"
                                                    placeholder="Price"
                                                    value={newData.LimeaPrice}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-16"
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    name="Limew"
                                                    placeholder="Lime (W)"
                                                    value={newData.Limew}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-20"
                                                />
                                                <span className="text-gray-600 mx-2">x</span>
                                                <input
                                                    type="text"
                                                    name="LimewPrice"
                                                    placeholder="Price"
                                                    value={newData.LimewPrice}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-16"
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    name="Limeb"
                                                    placeholder="Lime (B)"
                                                    value={newData.Limeb}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-20"
                                                />
                                                <span className="text-gray-600 mx-2">x</span>
                                                <input
                                                    type="text"
                                                    name="LimebPrice"
                                                    placeholder="Price"
                                                    value={newData.LimebPrice}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-16"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    name="Limeoffw"
                                                    placeholder="Lime (OFF_W)"
                                                    value={newData.Limeoffw}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-20"
                                                />
                                                <span className="text-gray-600 mx-2">x</span>
                                                <input
                                                    type="text"
                                                    name="LimeoffwPrice"
                                                    placeholder="Price"
                                                    value={newData.LimeoffwPrice}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-16"
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    name="jhiki"
                                                    placeholder="Jhiki"
                                                    value={newData.jhiki}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-20"
                                                />
                                                <span className="text-gray-600 mx-2">x</span>
                                                <input
                                                    type="text"
                                                    name="jhikiPrice"
                                                    placeholder="Price"
                                                    value={newData.jhikiPrice}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-16"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    name="rs"
                                                    placeholder="Aaras"
                                                    value={newData.rs}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-20"
                                                />
                                                <span className="text-gray-600 mx-2">x</span>
                                                <input
                                                    type="text"
                                                    name="rsPrice"
                                                    placeholder="Price"
                                                    value={newData.rsPrice}
                                                    onChange={handleFormChange}
                                                    className="border p-2 rounded-md md:w-52 w-16"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                name="siteaddress"
                                                placeholder="Site Address"
                                                value={newData.siteaddress}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                name="labourcharge"
                                                placeholder="Labour Charge"
                                                value={newData.labourcharge}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                name="autocharge"
                                                placeholder="Auto Charge"
                                                value={newData.autocharge}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                name="extracharge"
                                                placeholder="Extra Charge"
                                                value={newData.extracharge}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                            <input
                                                type="text"
                                                name="cr"
                                                placeholder="CR"
                                                value={newData.cr}
                                                onChange={handleFormChange}
                                                className="border p-2 rounded-md"
                                            />
                                        </div>
                                        <div className="flex mt-4">
                                            <button type="submit" className='bg-indigo-600 p-3 px-6 rounded mr-4'>{editingIndex !== null ? 'Update' : 'Add'}</button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingData(false)}
                                                className=" text-black bg-red-600 p-3 px-6 rounded mr-4"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                    </form>



                                </div>
                            </div>
                        )}
                        <div className="flex justify-center space-x-2 print:hidden">
                            <button
                                onClick={goToFirstPage}
                                disabled={currentPage === 1}
                                className="md:px-4 md:py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:font-bold"
                            >
                                First Page
                            </button>
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="md:px-4 md:py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:only:font-bold"
                            >
                                Previous Page
                            </button>
                            <span className="text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="md:px-4 md:py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:only:font-bold"
                            >
                                Next Page
                            </button>
                            <button
                                onClick={goToLastPage}
                                disabled={currentPage === totalPages}
                                className="md:px-4 md:py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:only:font-bold"
                            >
                                Last Page
                            </button>
                        </div>
                        <div className="mt-10 py-4 border-t md:text-center">
                            <p className='text-center'>© 2023  Jai Lime & Chemical. All rights reserved.</p>
                        </div>
                    </div>
                )}










                {role === 'user' && (
                    <div className='pt-10'>
                        <div className="w-full px-4 md:px-8">
                            <div className="items-start justify-between md:flex">
                                <div className='md:pb-0 pb-16'>
                                    <Image
                                        src={jlc}
                                        width={150}
                                        height={200}
                                        className='absolute md:ml-6 md:w-40 w-24 ml-32 top-5'
                                        alt="Logo"
                                    />
                                </div>
                                <div className="mt-3 mb-3 md:mt-0 md:ml-0 ml-28 print:hidden">
                                    <LogoutButton />
                                </div>
                            </div>
                            <table className="border-2 border-black mx-auto">
                                <tbody>
                                    <tr>
                                        <td className="border-2 border-black md:p-6 p-0 md:px-40 text-center ">
                                            <div className='md:text-6xl text-5xl font-bold font-serif'>
                                                JAI LIME & CHEMICAL
                                            </div>
                                            <div className='md:text-xl text-lg'>
                                                H-1, 503, Road No 15, Bhamashah Ind. Area, Kaladwas, Udaipur
                                            </div>
                                            <div className='md:text-xl text-lg'>
                                                Mo. : 99508 35585, 85296 22695
                                            </div>
                                            <div className='md:text-xl text-lg'>
                                                GST No. 08ADVPJ9429L1ZL &nbsp; &nbsp; Email: jailime79@gmail.com
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="max-w-lg mt-10 mb-10">
                                <h3 className="text-gray-800 text-xl font-bold sm:text-4xl mb-4">
                                    {customer.customername}&apos;s खाता
                                </h3>
                            </div>
                            <div className=' mt-4 p-4 border rounded-lg print:hidden '>
                                <label className="mr-4 text-lg">Start Date:</label>
                                <input
                                    type="text"
                                    style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '6px', margin: '2px' }}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    placeholder='dd/mm/yy'
                                />
                                <label className="ml-4 mr-4 text-lg">End Date:</label>
                                <input
                                    type="text"
                                    style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '6px', margin: '2px' }}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    placeholder='dd/mm/yy'
                                />

                                <button
                                    onClick={applyDateRangeFilter}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md ml-8 md:mt-0 mt-2"
                                >
                                    Apply Filter
                                </button>
                                <button
                                    onClick={clearFilter}
                                    className="bg-red-500 hover.bg-red-700 text-white font-bold py-2 px-4 rounded-md ml-4"
                                >
                                    Clear Filter
                                </button>
                            </div>
                            <div className="mt-4 shadow-sm border rounded-lg overflow-x-auto mb-10">
                                <table className="w-full table-auto text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                        <tr className='divide-x'>

                                            <th className="py-3 px-2 md:text-2xl">S. NO.</th>
                                            <th className="py-3 px-6 md:text-2xl">Sales Date</th>
                                            <th className="py-3 px-2 md:text-2xl">Driver Name</th>
                                            <th className="py-3 px-6 md:text-2xl">Auto No.</th>
                                            <th className="py-3 px-6 md:text-2xl">Lime (A)</th>
                                            <th className="py-3 px-6 md:text-2xl">Lime (W)</th>
                                            <th className="py-3 px-6 md:text-2xl">Lime (B)</th>
                                            <th className="py-3 px-6 md:text-2xl">Lime (OFF_W)</th>
                                            <th className="py-3 px-6 md:text-2xl">Jhiki (झिकीं)</th>
                                            <th className="py-3 px-6 md:text-2xl">Aaras (आरस)</th>
                                            <th className="py-3 px-6 md:text-2xl">Site Address</th>
                                            <th className="py-3 px-6 md:text-2xl">Amount</th>
                                            <th className="py-3 px-2 md:text-2xl">Labour Charge</th>
                                            <th className="py-3 px-2 md:text-2xl">Auto Charge</th>
                                            <th className="py-3 px-2 md:text-2xl">Extra Charges</th>
                                            <th
                                                className={`py-3 px-6 md:text-2xl `}

                                            >
                                                <div className='flex'>
                                                    DR (बकाया)

                                                </div>
                                            </th>
                                            <th
                                                className={`py-3 px-6 md:text-2xl `}

                                            >
                                                <div className='flex'>
                                                    CR (जमा)

                                                </div>
                                            </th>
                                            <th className="py-3 px-6 md:text-2xl">Balance (शेष)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 divide-y">

                                        {customer && customer.data
                                            ? (paginatedFilteredData).map((item, idx) => (
                                                <tr key={idx} className="divide-x">
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-2xl"> {item.numberid === '' ? '-' : item.numberid}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.salesdate && !isNaN(new Date(item.salesdate).getTime()) ? format(new Date(item.salesdate), 'dd/MM/yy') : '-'}
                                                    </td>

                                                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.drivername === '' ? '-' : item.drivername}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">{item.autono === '' ? '-' : item.autono}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.Limea ? (
                                                            `${item.Limea} X ${item.LimeaPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.Limew ? (
                                                            `${item.Limew} X ${item.LimewPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.Limeb ? (
                                                            `${item.Limeb} X ${item.LimebPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.Limeoffw ? (
                                                            `${item.Limeoffw} X ${item.LimeoffwPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.jhiki ? (
                                                            `${item.jhiki} X ${item.jhikiPrice}`
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.rs ? (
                                                            `${item.rs} KG X ${item.rsPrice}`
                                                        ) : '-'}
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.siteaddress === '' ? '-' : item.siteaddress}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {isNaN(item.amount) || item.amount === '' ? '0' : parseFloat(item.amount).toFixed(2)}
                                                    </td>


                                                    <td className="px-2 py-4 whitespace-nowrap font-bold text-center md:text-2xl">{item.labourcharge === '' ? '-' : item.labourcharge}</td>
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold text-center md:text-2xl">{item.autocharge === '' ? '-' : item.autocharge}</td>
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold text-center md:text-2xl">{item.extracharge === '' ? '-' : item.extracharge}</td>

                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">{item.dr}</td>
                                                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.cr === '' ? '0' : parseFloat(item.cr).toLocaleString('en-IN')}
                                                    </td>


                                                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-2xl">
                                                        {item.balance < 0
                                                            ? `${formatDecimalWithCommasAndDecimals(Math.abs(item.balance))} ADV`
                                                            : formatDecimalWithCommasAndDecimals(item.balance)}
                                                    </td>

                                                </tr>
                                            )) : null}
                                    </tbody>
                                </table>


                            </div>
                            <div className='md:text-2xl mb-4'>- कृपया निवेदन है कि हिसाब में कोई भी भूल चूक होने पर फोन पर तुरंत सूचित करें ताकि समय पर सुधार हो सके !</div>


                        </div>

                        <div className="flex justify-center space-x-2 print:hidden">
                            <button
                                onClick={goToFirstPage}
                                disabled={currentPage === 1}
                                className="md:px-4 md:py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:font-bold"
                            >
                                First Page
                            </button>
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="md:px-4 md:py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:only:font-bold"
                            >
                                Previous Page
                            </button>
                            <span className="text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="md:px-4 md:py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:only:font-bold"
                            >
                                Next Page
                            </button>
                            <button
                                onClick={goToLastPage}
                                disabled={currentPage === totalPages}
                                className="md:px-4 md:py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:only:font-bold"
                            >
                                Last Page
                            </button>
                        </div>
                        <div className="mt-10 py-4 border-t md:text-center">
                            <p className='text-center'>© 2023  Jai Lime & Chemical. All rights reserved.</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };
}


export default Landing
