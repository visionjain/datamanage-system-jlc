import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { format, isToday } from 'date-fns';
import Image from 'next/image';
import { parse, isWithinInterval } from 'date-fns';
import { BsFillArrowUpSquareFill, BsCloudDownload, BsPrinter, BsFileEarmarkExcel } from 'react-icons/bs';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import jlc from "../../public/logojlc.png"
import { HiOutlineLogout } from 'react-icons/hi';

const TodayData = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem('token');

    // Redirect to the login page or any other desired location
    router.push('/login');
};
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/getcustomer');
        const allCustomerData = response.data.customer;

        // Filter and extract rows with sales date matching the current date
        const filteredRows = allCustomerData.map((customer) => {
          const filteredData = customer.data.filter((row) => {
            const salesDate = parse(row.salesdate, 'dd/MM/yy', new Date());
            return isToday(salesDate); // Filter by today's date
          });

          return { ...customer, data: filteredData };
        });

        // Log the filtered data
        console.log('Filtered Data:', filteredRows);

        setFilteredData(filteredRows);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = today.getFullYear().toString().slice(-2);

    setCurrentDate(`${dd}/${mm}/${yy}`);
  }, []);


  return (
    <div>
      
      <div className='bg-[#F4F4F4] text-black print:hidden md:h-[22vh] h-[50vh] border-b border-gray-400 shadow-lg'>
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
                                    <div className='md:w-5/6 md:flex'>
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
                                                className="logout-button bg-[#494949] text-white p-3 md:ml-40 ml-40 md:mt-10 mt-4 md:w-20 md:h-20 w-18 h-18 rounded-full flex flex-col items-center justify-center text-center"
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
      <div>
      <p className='text-xl mt-2 ml-4'>Today&apos;s Date: {currentDate}</p>
      <div className="mt-4 shadow-sm border rounded-lg overflow-x-auto mb-10 mx-4">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr className='divide-x'>
              <th className="py-3 px-2 md:text-lg">Customer Name</th>
              <th className="py-3 px-2 md:text-lg">S. NO.</th>
              <th className="py-3 px-2 md:text-lg">Driver Name</th>
              <th className="py-3 px-6 md:text-lg">Auto No.</th>
              <th className="py-3 px-6 md:text-lg">Lime (A)</th>
              <th className="py-3 px-6 md:text-lg">Lime (W)</th>
              <th className="py-3 px-6 md:text-lg">Lime (B)</th>
              <th className="py-3 px-6 md:text-lg">Lime (OFF_W)</th>
              <th className="py-3 px-6 md:text-lg">Jhiki (झिकीं)</th>
              <th className="py-3 px-6 md:text-lg">Aaras (आरस)</th>
              <th className="py-3 px-6 md:text-lg">Site Address</th>
              <th className="py-3 px-6 md:text-lg">Amount</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {filteredData.map((customer) => (
              <React.Fragment key={customer._id}>
                {customer.data.map((item, idx) => (
                  <tr key={item._id} className="divide-x">
                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-lg">
                      {customer.customername}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-lg"> {item.numberid === '' ? '-' : item.numberid}</td>

                    <td className="px-2 py-4 whitespace-nowrap font-bold md:text-lg">
                      {item.drivername === '' ? '-' : item.drivername}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">{item.autono === '' ? '-' : item.autono}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">
                      {item.Limea ? (
                        `${item.Limea} X ${item.LimeaPrice}`
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">
                      {item.Limew ? (
                        `${item.Limew} X ${item.LimewPrice}`
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">
                      {item.Limeb ? (
                        `${item.Limeb} X ${item.LimebPrice}`
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">
                      {item.Limeoffw ? (
                        `${item.Limeoffw} X ${item.LimeoffwPrice}`
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">
                      {item.jhiki ? (
                        `${item.jhiki} X ${item.jhikiPrice}`
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">
                      {item.rs ? (
                        `${item.rs} KG X ${item.rsPrice}`
                      ) : '-'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">
                      {item.siteaddress === '' ? '-' : item.siteaddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold md:text-lg">
                      {isNaN(item.amount) || item.amount === '' ? '0' : parseFloat(item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default TodayData;
