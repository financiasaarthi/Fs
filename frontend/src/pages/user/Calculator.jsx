// import React, { useState } from 'react';

// function Calculator() {
//   const [deposit, setDeposit] = useState(100);
//   const [days, setDays] = useState(30);
//   const [dailyRate, setDailyRate] = useState(1.30); // 1.30% by default

//   // Calculations
//   const rateInDecimal = dailyRate / 100;
  
//   // Normal ROI (Without Compounding) = Principal * Rate * Days
//   const normalProfit = deposit * rateInDecimal * days;
//   const normalTotal = Number(deposit) + normalProfit;

//   // Compounding ROI = Principal * (1 + Rate)^Days
//   const compoundTotal = deposit * Math.pow((1 + rateInDecimal), days);
//   const compoundProfit = compoundTotal - deposit;

//   // Difference
//   const extraEarned = compoundTotal - normalTotal;

//   return (
//     <div>
//       <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', display: 'inline-block' }}>
//         Premium Compounding Calculator
//       </h2>
//       <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
//         Discover the power of compound interest. See how much faster your wealth grows when you reinvest your daily profits!
//       </p>

//       <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
//         {/* LEFT COLUMN: Controls */}
//         <div className="card" style={{ flex: '1 1 300px', padding: '2rem', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
//           <h3 style={{ color: '#34495e', marginBottom: '20px' }}>Investment Details</h3>
          
//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>Initial Deposit ($):</label>
//           <input 
//             type="number" 
//             value={deposit} 
//             onChange={(e) => setDeposit(Number(e.target.value))} 
//             style={{ width: '100%', marginBottom: '20px', padding: '12px', border: '1px solid #bdc3c7', borderRadius: '6px', fontSize: '1.1rem' }}
//           />

//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>Investment Period (Days):</label>
//           <input 
//             type="number" 
//             value={days} 
//             onChange={(e) => setDays(Number(e.target.value))} 
//             style={{ width: '100%', marginBottom: '20px', padding: '12px', border: '1px solid #bdc3c7', borderRadius: '6px', fontSize: '1.1rem' }}
//           />

//           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>Daily ROI Rate (%):</label>
//           <input 
//             type="number" 
//             step="0.1"
//             value={dailyRate} 
//             onChange={(e) => setDailyRate(Number(e.target.value))} 
//             style={{ width: '100%', marginBottom: '20px', padding: '12px', border: '1px solid #bdc3c7', borderRadius: '6px', fontSize: '1.1rem', backgroundColor: '#f8f9fa' }}
//           />
//         </div>

//         {/* RIGHT COLUMN: Results Comparison */}
//         <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
//           <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
//             {/* Standard Plan Box */}
//             <div className="card" style={{ flex: 1, padding: '2rem', backgroundColor: '#fdfefe', border: '1px solid #e5e8e8', borderRadius: '10px' }}>
//               <h4 style={{ color: '#7f8c8d', margin: 0, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Standard Plan</h4>
//               <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#95a5a6', marginBottom: '20px' }}>Without Compounding</p>
              
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed #ecf0f1', paddingBottom: '5px' }}>
//                 <span style={{ color: '#34495e' }}>Total Profit:</span>
//                 <span style={{ fontWeight: 'bold', color: '#3498db' }}>+ ${normalProfit.toFixed(2)}</span>
//               </div>
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
//                 <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>Total Return:</span>
//                 <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#2980b9' }}>${normalTotal.toFixed(2)}</span>
//               </div>
//             </div>

//             {/* Compounding Plan Box (Premium Look) */}
//             <div className="card" style={{ flex: 1, padding: '2rem', backgroundColor: '#f4fbf7', border: '2px solid #2ecc71', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
//               <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#2ecc71', color: 'white', padding: '5px 15px', fontSize: '0.8rem', fontWeight: 'bold', borderBottomLeftRadius: '10px' }}>
//                 RECOMMENDED
//               </div>
//               <h4 style={{ color: '#27ae60', margin: 0, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Compounding Plan</h4>
//               <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '20px' }}>Daily Re-investment</p>
              
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed #a3e4d7', paddingBottom: '5px' }}>
//                 <span style={{ color: '#34495e' }}>Total Profit:</span>
//                 <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>+ ${compoundProfit.toFixed(2)}</span>
//               </div>
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
//                 <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>Total Return:</span>
//                 <span style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#27ae60' }}>${compoundTotal.toFixed(2)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Highlight Banner */}
//           <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '10px', borderLeft: '5px solid #f39c12', display: 'flex', alignItems: 'center', gap: '15px' }}>
//             <span style={{ fontSize: '2.5rem' }}>🚀</span>
//             <div>
//               <h4 style={{ margin: 0, color: '#d35400' }}>The Power of Compounding!</h4>
//               <p style={{ margin: '5px 0 0 0', color: '#e67e22' }}>
//                 By choosing the compounding strategy, you earn an extra <strong>${extraEarned.toFixed(2)}</strong> over {days} days compared to the standard plan.
//               </p>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// export default Calculator;