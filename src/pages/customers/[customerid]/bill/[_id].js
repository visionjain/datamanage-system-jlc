import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '../../../../components/Customers/useAuth'
import { calculateBalanceForCustomer } from '../../../../components/Customers/customers';
const BillPage = () => {
  useAuth();
  const router = useRouter();
  const { customerid, _id } = router.query;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the customer data for the specified customerid
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/getcustomer`);
        const allCustomerData = response.data.customer; 

        // Debugging: Log the fetched data

        // Find the customer that matches the current customer ID (customerid)
        const matchingCustomer = allCustomerData.find((customer) => customer.customerid === customerid);

        // Debugging: Log the matching customer

        if (matchingCustomer) {
          setCustomer(matchingCustomer); // Set the matching customer object
        }
        // Set loading to false once data is fetched
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [customerid]);


  const OldDue = calculateBalanceForCustomer(customer);

  const valueToNumber = (value) => {
    const numericValue = parseFloat(value);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  const handlePrint = () => {
    window.print();
  };

  // Render the component
  return (
    <div>{loading ? (
      <p>Loading...</p>
    ) : (
      <div>
        <div className='align-right flex mt-2'>
          <button
            onClick={handlePrint}
            className="bg-red-600 text-white px-4 py-2 rounded-lg ml-10 align-right print:hidden"
          >
            Print Challan
          </button>
        </div>
        <div>
          <div className="w-[60%] h-[80%] mt-10">
          {customer && (
  <div className="w-full">
    <table className="border-2 border-black w-full mb-6 ml-0 md:ml-44 sm:ml-28 lg:ml-60">
      <tbody>
        <tr>
          <td className="border-2 border-black p-6 text-center" colSpan="5">
            <div className="text-5xl font-bold font-serif">JAI LIME & CHEMICAL</div>
            <div>H-1, 503, Road No 15, Bhamashah Ind. Area, Kaladwas, Udaipur</div>
            <div>Mo. : 99508 35585, 85296 22695</div>
            <div>GST No. 08ADVPJ9429L1ZL &nbsp; &nbsp; Email: jailime79@gmail.com</div>
          </td>
        </tr>
        {customer.data &&
  customer.data.length > 0 &&
  customer.data.map((item) => { // Define item in this map function
    if (item._id === _id) {
              return (
                <React.Fragment key={item._id}>
                              <tr>
                                <td className="border-2 font-bold border-black p-2" style={{ width: '20%' }}>
                                  Challan No.
                                </td>
                                <td className="border-2 border-black p-2" style={{ width: '30%' }}>
                                  {item.numberid}
                                </td>
                                <td className="border-2 font-bold border-black p-2" style={{ width: '20%' }}>
                                  Sales Date
                                </td>
                                <td className="border-2 border-black p-2" style={{ width: '30%' }} colSpan="4">
                                  {item.salesdate}
                                </td>
                              </tr>
                              <tr>
                                <td className="border-2 font-bold border-black p-2" style={{ width: '20%' }}>
                                  Client Name
                                </td>
                                <td className="border-2 border-black p-2" style={{ width: '30%' }}>
                                  {customer.customername}
                                </td>
                                <td className="border-2 font-bold border-black p-2" style={{ width: '20%' }}>
                                  Driver Name
                                </td>
                                <td className="border-2 border-black p-2" style={{ width: '30%' }} colSpan="4">
                                  {item.drivername}
                                </td>
                              </tr>
                              <tr>
                                <td className="border-2 font-bold border-black p-2" style={{ width: '20%' }}>
                                  Vehical No.
                                </td>
                                <td className="border-2 border-black p-2" style={{ width: '30%' }}>
                                  {item.autono}
                                </td>
                                <td className="border-2 font-bold border-black p-2" style={{ width: '20%' }}>
                                  K.M.
                                </td>
                                <td className="border-2 border-black p-2" style={{ width: '30%' }} colSpan="4">
                                  {item.km}
                                </td>
                              </tr>
                              <tr>
                                <td className="border-2 font-bold border-black p-2" style={{ width: '20%' }}>
                                  Site Address
                                </td>
                                <td className="border-2 border-black p-2" colSpan="4">
                                  {item.siteaddress}
                                </td>
                              </tr>
                              <tr colSpan="4">
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Product</td>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Weight Per Bag</td>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Quantity</td>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Rate+GST(5%) SCST 2.5% + CGST 2.5%</td>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Amount</td>
                              </tr>
                              <tr colSpan="4">
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Lime A</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>20 KG</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.Limea}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.LimeaPrice}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'> {(valueToNumber(item.Limea) * valueToNumber(item.LimeaPrice))}</td>
                              </tr>
                              <tr>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Lime W</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>20 KG</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.Limew}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.LimewPrice}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'> {(valueToNumber(item.Limew) * valueToNumber(item.LimewPrice))}</td>
                              </tr>
                              <tr>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Lime B</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>20 KG</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.Limeb}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.LimebPrice}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'> {(valueToNumber(item.Limeb) * valueToNumber(item.LimebPrice))}</td>
                              </tr>
                              <tr>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>JHIKI</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>20 KG</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.jhiki}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.jhikiPrice}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'> {(valueToNumber(item.jhiki) * valueToNumber(item.jhikiPrice))}</td>
                              </tr>
                              <tr>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>RS</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>20 KG</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.rs}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'>{item.rsPrice}</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'> {(valueToNumber(item.rs) * valueToNumber(item.rsPrice))}</td>
                              </tr>
                              <tr>
                                <td style={{ width: '20%' }} className='p-2'></td>
                                <td style={{ width: '20%' }} className='p-2'></td>
                                <td style={{ width: '20%' }} className='p-2'></td>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Amount</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'> {item.amount}</td>
                              </tr>
                              <tr>
                                <td style={{ width: '20%' }} className='p-2'></td>
                                <td style={{ width: '20%' }} className=' p-2'></td>
                                <td style={{ width: '20%' }} className=' p-2'></td>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Auto Charge</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'> {item.autocharge}</td>
                              </tr>
                              <tr>
                                <td style={{ width: '20%' }} className='p-2'></td>
                                <td style={{ width: '20%' }} className='p-2'></td>
                                <td style={{ width: '20%' }} className='p-2'></td>
                                <td style={{ width: '20%' }} className='border-2 font-bold border-black p-2'>Labour Charge</td>
                                <td style={{ width: '20%' }} className='border-2 border-black p-2'> {item.labourcharge}</td>
                              </tr>
                              <tr>
                                <td className='border-2 font-bold border-black p-2' colSpan="3">Old Due / पुराना बकाया &nbsp;&nbsp;&nbsp; -&nbsp;&nbsp; {OldDue.toLocaleString('en-IN')}/-</td>
                                <td className='border-2 font-bold border-black p-2'>Total</td>
                                <td className='border-2 border-black p-2'> {valueToNumber(item.amount) + valueToNumber(item.autocharge) + valueToNumber(item.labourcharge)}</td>
                              </tr>
                              <tr>
                                <td className="border-2 border-black " colSpan={5}>
                                  <div className=" font-bold text-xl">
                                    नियम व शर्ते</div>
                                  <div>1. बेचा हुआ माल वापस नहीं लिया जायेगा ।</div>
                                  <div className='text-xl font-bold text-right mr-4'>हस्ताक्षर</div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        }
                        return null;
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )}</div>

  );
};

export default BillPage;
