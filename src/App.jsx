import React, { useState } from 'react';
// Assuming your original styles are imported here
// import styles from './CreditCardPrediction.module.css'; 

const App = () => {
    // 1. State for all input fields
    const [formData, setFormData] = useState({
        cibilScore: '', // Replaced 'Credit Score' with more specific 'CIBIL Score'
        annualIncome: '',
        age: '', // New Field
        maritalStatus: 'Single', // New Field with default value
        employmentStatus: 'Employed',
        creditLimitRequested: '', // Replaced 'Loan Amount' with a more relevant field
        currentDebt: '',
        numDependents: '', // New Field (e.g., Number of Dependents)
    });

    const [predictionResult, setPredictionResult] = useState({
        status: 'Pending Analysis', // 'Approved', 'Rejected'
        confidence: null,
    });

    const [isPredicting, setIsPredicting] = useState(false);
    const [showAdvice, setShowAdvice] = useState(false);
    const [adviceMessage, setAdviceMessage] = useState('');

    // Handle adjust application button
    const handleAdjustApplication = () => {
        // Reset form
        setFormData({
            cibilScore: '',
            annualIncome: '',
            age: '',
            maritalStatus: 'Single',
            employmentStatus: 'Employed',
            creditLimitRequested: '',
            currentDebt: '',
            numDependents: '',
        });
        setPredictionResult({
            status: 'Pending Analysis',
            confidence: null,
        });

        // If rejected, provide advice
        if (predictionResult.status === 'REJECTED') {
            const reasons = [];

            const cibil = parseInt(formData.cibilScore) || 0;
            const income = parseInt(formData.annualIncome) || 0;
            const age = parseInt(formData.age) || 0;
            const limitRequested = parseInt(formData.creditLimitRequested) || 0;
            const debt = parseInt(formData.currentDebt) || 0;
            const dependents = parseInt(formData.numDependents) || 0;
            const employment = formData.employmentStatus;

            if (cibil < 650) {
                reasons.push('Your CIBIL score is low. Consider improving your credit score.');
            }
            if (income > 0 && (debt / income) * 100 > 40) {
                reasons.push('Your debt-to-income ratio is high. Try to reduce your current debt.');
            }
            if (income > 0 && limitRequested > income * 0.5) {
                reasons.push('The requested credit limit is too high compared to your income.');
            }
            if (age < 25 || age > 60) {
                reasons.push('Your age may affect approval. Consider other factors.');
            }
            if (employment === 'Unemployed') {
                reasons.push('Unemployment status negatively impacts approval.');
            }
            if (employment === 'Student') {
                reasons.push('Student status may affect approval.');
            }
            if (dependents > 3) {
                reasons.push('High number of dependents may affect approval.');
            }

            if (reasons.length > 0) {
                setAdviceMessage(reasons.join(' '));
            } else {
                setAdviceMessage('Your application was rejected. Please review your details and try again.');
            }
            setShowAdvice(true);
        }
    };

    // Handle change for all form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission (API call to your ML model backend would go here)
    // Updated to accept the event 'e' and prevent default
    const handlePrediction = async (e) => {
        e.preventDefault(); // Prevent page reload
        setIsPredicting(true); // Start animation
        console.log('Form Data Submitted:', formData);

        // --- UPDATED SIMULATION LOGIC ---
        // This logic now calculates a dynamic confidence and removes the 'PENDING' status.

        // Convert string inputs to numbers
        const cibil = parseInt(formData.cibilScore) || 0;
        const income = parseInt(formData.annualIncome) || 0;
        const age = parseInt(formData.age) || 0;
        const limitRequested = parseInt(formData.creditLimitRequested) || 0;
        const debt = parseInt(formData.currentDebt) || 0;
        const dependents = parseInt(formData.numDependents) || 0;
        const employment = formData.employmentStatus;

        // Automatic rejection if age is less than 21
        if (age < 21) {
            setTimeout(() => {
                setPredictionResult({
                    status: 'REJECTED',
                    confidence: 99.0
                });
                setIsPredicting(false);
            }, 1000);
            return;
        }

        let applicationScore = 0;

        // 1. CIBIL Score logic
        if (cibil >= 750) {
            applicationScore += 10;
        } else if (cibil >= 650) {
            applicationScore += 5;
        } else {
            applicationScore -= 10;
        }

        // 2. Debt-to-Income Ratio (DTI) logic
        if (income > 0) {
            const dti = (debt / income) * 100;
            if (dti > 40) {
                applicationScore -= 5; // High DTI is bad
            } else if (dti < 20) {
                applicationScore += 5; // Low DTI is good
            }
        } else if (debt > 0) {
            applicationScore -= 10; // Debt with no income
        }

        // 3. Requested Limit vs. Income
        if (income > 0 && limitRequested > (income * 0.5)) {
            applicationScore -= 5; // Asking for too much
        }

        // 4. Age logic
        if (age < 25 || age > 60) {
            applicationScore -= 2; // Very young or near retirement
        } else if (age >= 30 && age <= 50) {
            applicationScore += 2; // Prime earning years
        }

        // 5. Employment logic
        if (employment === 'Unemployed') {
            applicationScore -= 10;
        } else if (employment === 'Student') {
            applicationScore -= 5;
        } else if (employment === 'Employed' || employment === 'Self-Employed') {
            applicationScore += 5;
        }

        // 6. Dependents logic
        if (dependents > 3) {
            applicationScore -= 2; // High number of dependents
        }

        // --- END OF SCORE CALCULATION ---

        // --- NEW APPROVAL/REJECTION & CONFIDENCE LOGIC ---

        // Normalize the score to a 0-100 "approval probability"
        const minScore = -27; // Approx. worst score
        const maxScore = 22; // Approx. best score
        let approvalProbability = ((applicationScore - minScore) / (maxScore - minScore)) * 100;

        // Clamp probability between 1% and 99% for realism
        approvalProbability = Math.max(1, Math.min(99, approvalProbability));

        let finalStatus = 'REJECTED';
        let finalConfidence = 0;

        // Set threshold at 50%
        if (approvalProbability >= 50) {
            finalStatus = 'APPROVED';
            finalConfidence = approvalProbability; // Confidence of approval
        } else {
            finalStatus = 'REJECTED';
            finalConfidence = 100 - approvalProbability; // Confidence of rejection
        }

        // --- END OF NEW LOGIC ---

        // SIMULATED PREDICTION RESULT:
        setTimeout(() => {
            setPredictionResult({
                status: finalStatus,
                confidence: finalConfidence.toFixed(1) // Use the calculated confidence with 1 decimal
            });
            setIsPredicting(false); // End animation
        }, 1000);
    };

    // Define options for dropdowns
    const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed']; // Fixed typo 'Divorsed'
    const employmentStatusOptions = ['Employed', 'Self-Employed', 'Student', 'Unemployed'];
    
    // Helper function to render the icon based on status
    const renderStatusIcon = () => {
        const status = predictionResult.status;
        if (status === 'APPROVED') {
            return <span style={{ fontSize: '4rem', color: '#6be46b' }}>✓</span>; // Green checkmark
        } else if (status === 'REJECTED') {
            return <span style={{ fontSize: '4rem', color: '#ff4d4d' }}>×</span>; // Red X
        }
        return <span style={{ fontSize: '4rem', color: '#ffffff' }}>?</span>; // White question mark
    };
    
    // --- INLINE STYLES ---

    const containerStyle = {
        maxWidth: '1000px',
        margin: '50px auto',
        padding: '30px',
        borderRadius: '10px',
        backgroundColor: '#1e1e3f', // Dark background
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        // Use flex column to stack title, content, and buttons
        display: 'flex',
        flexDirection: 'column',
    };
    
    // New style for the 2-column (details + result) layout
    const mainContentStyle = {
         display: 'flex',
         gap: '40px',
         width: '100%', // Ensure it spans the container width
    };

    const sectionStyle = {
        flex: 1,
        padding: '20px',
        border: '1px solid #333',
        borderRadius: '8px',
        minWidth: '300px', // Prevent sections from getting too small
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        margin: '5px 0 0 0', // Changed margin
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#2b2b4f',
        color: '#ffffff',
        fontSize: '16px',
        boxSizing: 'border-box', // Important for 100% width
    };
    
    // Container for the horizontal buttons at the bottom
    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'center', // Center the buttons
        gap: '20px', // Space between buttons
        marginTop: '30px', // Space above the buttons
        width: '100%',
    };

    // Base style for new buttons (replaces old 'buttonStyle')
    const baseButtonStyle = {
        padding: '15px 30px', // Give horizontal padding
        borderRadius: '5px',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        fontWeight: 'bold',
        minWidth: '200px', // Ensure buttons have a nice width
        textAlign: 'center',
        transition: 'transform 0.2s ease-in-out', // Add transition for smooth animation
    };

    const primaryButtonStyle = {
        ...baseButtonStyle,
        backgroundColor: '#007bff',
        color: 'white',
        transform: isPredicting ? 'scale(0.95)' : 'scale(1)', // Scale down when predicting
    };
    
    const secondaryButtonStyle = {
         ...baseButtonStyle,
         backgroundColor: '#3a3a6b', // Secondary color
         color: 'white',
    };

    const resultTextStyle = {
        marginTop: '10px',
        fontSize: '2em',
        fontWeight: 'bold',
        color: predictionResult.status === 'APPROVED' ? '#6be46b' : predictionResult.status === 'REJECTED' ? '#ff4d4d' : '#ffffff',
        textAlign: 'center',
    };
    
    const labelStyle = {
        display: 'block',
        marginTop: '0', // Changed margin
        marginBottom: '5px',
        fontWeight: 'lighter',
        fontSize: '0.9em'
    }

    // --- NEW STYLES FOR 2-COLUMN FORM ---
    const formGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // 2 equal columns
        gap: '15px 20px', // 15px row gap, 20px column gap
    };

    const inputGroupStyle = {
        display: 'flex',
        flexDirection: 'column', // Stack label above input
    };
    // -------------------------------------

    return (
        <div style={containerStyle}>
            {/* Project Title */}
            <h1 style={{ width: '100%', textAlign: 'center', marginBottom: '30px' }}>
                CREDIT CARD PREDICTION
            </h1>

            {/* Subtitle REMOVED as requested */}
            {/* <p style={{...}}>...</p> */}


            {/* --- Main Content (Inputs & Results) --- */}
            {/* Form now wraps the main content and is linked to the external submit button */}
            <form id="prediction-form" onSubmit={handlePrediction}>
                <div style={mainContentStyle}>

                    {/* --- YOUR DETAILS SECTION (INPUT) --- */}
                    <div style={sectionStyle}>
                        <h2>YOUR DETAILS</h2>

                        {/* Wrap inputs in the new grid container */}
                        <div style={formGridStyle}>

                            {/* 1. CIBIL Score */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle} htmlFor="cibilScore">CIBIL/Credit Score (e.g., 300-900)</label>
                                <input
                                    type="number"
                                    id="cibilScore"
                                    name="cibilScore"
                                    placeholder="Enter your CIBIL Score"
                                    value={formData.cibilScore}
                                    onChange={handleChange}
                                    required
                                    min="300"
                                    max="900"
                                    style={inputStyle}
                                />
                            </div>

                            {/* 2. Age */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle} htmlFor="age">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    placeholder="Enter your Age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min="18"
                                    max="90"
                                    style={inputStyle}
                                />
                            </div>

                            {/* 3. Marital Status */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle} htmlFor="maritalStatus">Marital Status</label>
                                <select
                                    id="maritalStatus"
                                    name="maritalStatus"
                                    value={formData.maritalStatus}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                >
                                    {maritalStatusOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 4. Annual Income */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle} htmlFor="annualIncome">Annual Income (₹)</label>
                                <input
                                    type="number"
                                    id="annualIncome"
                                    name="annualIncome"
                                    placeholder="Enter Annual Income (e.g., 500000)"
                                    value={formData.annualIncome}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    style={inputStyle}
                                />
                            </div>

                            {/* 5. Employment Status */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle} htmlFor="employmentStatus">Employment Status</label>
                                <select
                                    id="employmentStatus"
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                >
                                    {employmentStatusOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 6. Credit Limit Requested */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle} htmlFor="creditLimitRequested">Credit Limit Requested (₹)</label>
                                <input
                                    type="number"
                                    id="creditLimitRequested"
                                    name="creditLimitRequested"
                                    placeholder="e.g., 100000"
                                    value={formData.creditLimitRequested}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    style={inputStyle}
                                />
                            </div>

                            {/* 7. Current Debt */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle} htmlFor="currentDebt">Total Current Debt (₹)</label>
                                <input
                                    type="number"
                                    id="currentDebt"
                                    name="currentDebt"
                                    placeholder="Total outstanding debt"
                                    value={formData.currentDebt}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    style={inputStyle}
                                />
                            </div>

                            {/* 8. Number of Dependents */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle} htmlFor="numDependents">Number of Dependents</label>
                                <input
                                    type="number"
                                    id="numDependents"
                                    name="numDependents"
                                    placeholder="e.g., 2"
                                    value={formData.numDependents}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    style={inputStyle}
                                />
                            </div>

                        </div> {/* End of formGridStyle */}
                    </div>

                    {/* --- PREDICTION RESULT SECTION --- */}
                    <div style={sectionStyle}>
                        <h2>PREDICTION RESULT</h2>
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            {renderStatusIcon()}
                            <div style={resultTextStyle}>
                                {predictionResult.status}
                            </div>
                            {predictionResult.confidence && predictionResult.status !== 'Pending Analysis' && (
                                <p style={{ marginTop: '10px', color: '#aaa' }}>
                                    {predictionResult.confidence}% Confidence
                                </p>
                            )}
                        </div>

                        {/* "ADJUST APPLICATION" button MOVED from here */}
                    </div>

                </div>
            </form>

            {/* --- HORIZONTAL BUTTON CONTAINER --- */}
            <div style={buttonContainerStyle}>
                <button
                    type="submit"
                    form="prediction-form" /* This links the button to the form */
                    style={primaryButtonStyle}
                >
                    GET PREDICTION
                </button>

                <button
                    type="button" /* Set to button to prevent form submission */
                    style={secondaryButtonStyle}
                    onClick={handleAdjustApplication}
                >
                    ADJUST APPLICATION
                </button>
            </div>

            {/* Advice Modal */}
            {showAdvice && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#1e1e3f',
                        padding: '30px',
                        borderRadius: '10px',
                        maxWidth: '500px',
                        width: '90%',
                        color: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Application Advice</h3>
                        <p style={{ marginBottom: '20px', lineHeight: '1.5' }}>{adviceMessage}</p>
                        <div style={{ textAlign: 'center' }}>
                            <button
                                onClick={() => setShowAdvice(false)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;