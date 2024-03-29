import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ExcelGenerator from '../../../components/landing/ExcelGenerator';
import axios from 'axios';
import { useAuth } from '../../../components/Customers/useAuth'
import LogoutButton from "../../../components/Customers/LogoutButton";

const Landing = () => {
    useAuth();
    const [labour, setLabour] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newData, setNewData] = useState({
        date: '',
        lot: '',
        wages: '',
        amount: '',
        gas: '',
        cashrec: '',
        totalamount: '',
        remark:'',
    });

    const router = useRouter();
    const labourid = router.query.labourid;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/getlabour');
                const allLabourData = response.data.labour;

                const matchingLabour = allLabourData.find(
                    (labour) => labour.labourid === labourid
                );

                if (matchingLabour) {
                    const initialAmount = matchingLabour.lot * 450;
                    setNewData({
                        date: '',
                        lot: matchingLabour.lot,
                        wages: '',
                        amount: initialAmount,
                        gas: '',
                        cashrec: '',
                        totalamount: '',
                        remark:'',
                    });
                    setLabour(matchingLabour);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [labourid]);

    useEffect(() => {
        // Calculate the amount based on the new lot value whenever it changes
        const calculatedAmount = parseFloat(newData.lot) === 0 ? 0 : parseFloat(newData.lot) * 450 || '';
        setNewData(prevData => ({
            ...prevData,
            amount: calculatedAmount,
        }));
    }, [newData.lot]);

    const handleAddDataClick = () => {
        setIsAddingData(true);
        setEditingIndex(null); // Clear editing index when adding new data
    };

    const handlePrint = () => {
        window.print();
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingData, setIsAddingData] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const filteredTableItems = labour && labour.data
        ? labour.data.filter(item => item.date.includes(searchQuery))
        : [];

    const handleDeleteClick = async (index, itemId) => {
        const shouldDelete = window.confirm("Are you sure you want to delete this item?");
        if (shouldDelete) {
            try {
                await axios.delete(`/api/deletelabitem?labourid=${labour.labourid}&itemid=${itemId}`);

                const updatedTableItems = labour.data.filter((item, idx) => idx !== index);
                setLabour(prevLabour => ({
                    ...prevLabour,
                    data: updatedTableItems,
                }));
                window.location.reload(true);
            } catch (error) {
                console.error('Error deleting data entry:', error);
            }
        }
    };

    const handleEditClick = (index) => {
        setEditingIndex(index);
        setNewData(labour.data[index]);
        setIsAddingData(true);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        try {
            if (editingIndex !== null) {
                const updatedTableItems = labour.data.map((item, index) =>
                    index === editingIndex ? newData : item
                );

                await axios.put(
                    `/api/updatelabitem?labourid=${labour.labourid}`,
                    newData
                );

                setLabour((prevLabour) => ({
                    ...prevLabour,
                    data: updatedTableItems,
                }));
            } else {
                const calculatedAmount = parseFloat(newData.lot) === 0 ? 0 : parseFloat(newData.lot) * 450 || '';
                newData.amount = calculatedAmount;

                await axios.post(
                    `/api/addlabitem?labourid=${labour.labourid}`,
                    newData
                );

                const updatedTableItems = [...labour.data, newData];
                setLabour((prevLabour) => ({
                    ...prevLabour,
                    data: updatedTableItems,
                }));
            }

            setNewData({
                date: '',
                lot: '',
                wages: '',
                amount: '',
                gas: '',
                cashrec: '',
                totalamount: '',
                remark: '',
            });
            setIsAddingData(false);
            setEditingIndex(null);
            window.location.reload(true);
        } catch (error) {
            console.error('Error adding data entry:', error);
        }
    };

    const calculateBalance = (data) => {
        let balance = 0;
        for (const item of data) {
            const amount = parseFloat(item.amount) || 0;
            const gas = parseFloat(item.gas) || 0;
            const cashrec = parseFloat(item.cashrec) || 0;

            const amountValue = isNaN(amount) ? 0 : amount;
            const gasValue = isNaN(gas) ? 0 : gas;
            const cashrecValue = isNaN(cashrec) ? 0 : cashrec;

            balance += amountValue - gasValue - cashrecValue;
            item.totalamount = balance < 0 ? `${Math.abs(balance)} ADV` : balance;
        }
    };

    if (labour) {
        calculateBalance(labour.data);

        return (
            <div className='pt-10'>
                <div className="w-full px-4 md:px-8">
                    <div className="items-start justify-between md:flex">
                        <div className="max-w-lg">
                            <h3 className="text-gray-800 text-xl font-bold sm:text-2xl mb-4">
                                {labour.labourname}&apos;s खाता
                            </h3>
                            {/* <ExcelGenerator tableItems={labour.data} /> */}
                        </div>
                        <div className="mt-3 md:mt-0 print:hidden">
                            <a
                                className="cursor-pointer inline-block px-4 py-2 text-white duration-150 font-medium bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 md:text-sm print:hidden"
                                onClick={handleAddDataClick}
                            >
                                Add Data
                            </a>
                            <button
                                onClick={handlePrint}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg ml-10 print:hidden"
                            >
                                Print Table
                            </button>
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
                            placeholder="Search by S.NO. / Labour Name / Date"
                            value={searchQuery}
                            onChange={event => setSearchQuery(event.target.value)}
                            className="border p-2 rounded-md w-full"
                        />
                    </div>

                    <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto mb-10">
                        <table className="w-full table-auto text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr className='divide-x'>
                                    <th className="py-3 px-6">Date</th>
                                    <th className="py-3 px-6">LOT</th>
                                    <th className="py-3 px-6">WAGES</th>
                                    <th className="py-3 px-6">Amount</th>
                                    <th className='py-3 px-6'>Gas + others</th>
                                    <th className="py-3 px-6">Daily Cash Recieved</th>
                                    <th className="py-3 px-6">Total Balance</th>
                                    <th className="py-3 px-6">Remarks</th>
                                    <th className="py-3 px-6">Signature</th>
                                    <th className="py-3 px-6 print:hidden"></th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 divide-y">

                                {labour && labour.data && filteredTableItems
                                    ? filteredTableItems.map((item, idx) => (
                                        <tr key={idx} className="divide-x">
                                            <td className="px-6 py-4 whitespace-nowrap font-bold">{item.date === '' ? '-' : item.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold">
                                                {item.lot === '' ? '-' : item.lot}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold">{item.wages === '' ? '-' : item.wages}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold">
                                                {item.amount === '' ? '-' : item.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold">
                                                {item.gas === '' ? '-' : item.gas}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold">
                                                {item.cashrec === '' ? '-' : item.cashrec}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold">
                                                {item.totalamount < 0 ? `${Math.abs(item.totalamount)} ADV` : item.totalamount}
                                            </td>
                                            <td className="px-6 py-4 font-bold whitespace-nowrap"> {item.remark === '' ? '-' : item.remark}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"></td>
                                            <td className="text-right px-6 whitespace-nowrap print:hidden">
                                                <button
                                                    onClick={() => handleEditClick(idx, item._id)}
                                                    className="py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(idx, item._id)}
                                                    className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                    : null}

                            </tbody>
                        </table>

                    </div>


                </div>
                {isAddingData && (
                    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Add New Data</h2>
                            <form onSubmit={handleFormSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="date"
                                        placeholder="Date"
                                        value={newData.date}
                                        onChange={handleFormChange}
                                        className="border p-2 rounded-md"
                                    />
                                    <input
                                        type="text"
                                        name="lot"
                                        placeholder="LOT"
                                        value={newData.lot}
                                        onChange={handleFormChange}
                                        className="border p-2 rounded-md"
                                    />
                                    <input
                                        type="text"
                                        name="wages"
                                        placeholder="Wages"
                                        value={newData.wages}
                                        onChange={handleFormChange}
                                        className="border p-2 rounded-md"
                                    />
                                    <input
                                        type="text"
                                        name="gas"
                                        placeholder="Gas"
                                        value={newData.gas}
                                        onChange={handleFormChange}
                                        className="border p-2 rounded-md"
                                    />
                                    <input
                                        type="text"
                                        name="cashrec"
                                        placeholder="Daily Cash Recieved"
                                        value={newData.cashrec}
                                        onChange={handleFormChange}
                                        className="border p-2 rounded-md"
                                    />
                                    <input
                                        type="text"
                                        name="remark"
                                        placeholder="Remarks"
                                        value={newData.remark}
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
                <div className="mt-10 py-4 border-t md:text-center">
                    <p>© 2023  Jai Lime & Chemical. All rights reserved.</p>
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-blue-500"></div>
            </div>
        );
    }
};

export default Landing;
