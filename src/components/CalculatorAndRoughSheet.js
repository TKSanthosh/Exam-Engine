import React, { useState, useEffect } from 'react';
import { evaluate } from 'mathjs';
import './Calculator.css'; // Ensure this path is correct
import calculator from './assets/images/calculator.png';
import roughsheet from './assets/images/pencil.png';
import { convertDate } from './utils';
import Draggable from 'react-draggable';

const CalculatorAndRoughSheet = ({ MembershipNo, QuestionPNo, SubjectCode, ExamDate, RoughtSheet }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [isCalculator, setIsCalculator] = useState(true);
    const [text, setText] = useState('');
    const [letterCount, setLetterCount] = useState(30000); // Initialize with max limit
    const [isVisible, setIsVisible] = useState(false);    

    useEffect(() => {
        const fetchRoughSheet = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/get-rough-sheet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        membership_no: MembershipNo,
                        subject_code: SubjectCode,
                        question_paper_no: QuestionPNo,
                        exam_date: convertDate(ExamDate),
                    }),
                }); 
                if (response.ok) {
                    const data = await response.json();
                    const fetchedText = data.message || ''; // Set the text with the fetched message
                    setText(fetchedText);
                    setLetterCount(30000 - fetchedText.length); // Update letter count
                } else {
                    console.error('Error fetching rough sheet');
                }
            } catch (error) {
                console.error('Error:', error);
            }  
        };

        fetchRoughSheet();
    }, [MembershipNo, SubjectCode, QuestionPNo, ExamDate]);

    const handleClick = (value) => {
        setInput(input + value);
    };

    const handleClear = () => {
        setInput('');
        setResult('');
    };

    const handleCalculate = () => {
        try {
            const evalResult = evaluate(input);
            setResult(evalResult);
        } catch (error) {
            setResult('Error');
        }
    };

    const handleDelete = () => {
        setInput(input.slice(0, -1));
    };

    const handleNegPos = () => {
        if (input) {
            setInput(input.startsWith('-') ? input.slice(1) : '-' + input);
        }
    };

    const handleRoughSheetChange = (e) => {
        const newText = e.target.value; 
        const newLetterCount = 30000 - newText.length; // Calculate remaining letters

        if (newLetterCount >= 0) {
            setText(newText); 
            setLetterCount(newLetterCount);
        }
    };

    const handleRoughSheetSave = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/save-rough-sheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    membership_no: MembershipNo,
                    question_paper_no: QuestionPNo,
                    subject_code: SubjectCode,
                    exam_date: convertDate(ExamDate),
                    text: text
                }),
            });
            if (response.ok) {
                alert('Saved successfully');
            } else {
                alert('Error saving');
            }
        } catch (error) {
            alert('Error saving');
        }
    };

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
<div>
            <a onClick={() => { setIsCalculator(true); toggleVisibility(); }}>
                <img title='Calculator' src={calculator} className='cal-btn' style={{ width: '15px', height: '15px' }} />
            </a>
            {RoughtSheet==='Y' && (
                <a onClick={() => { setIsCalculator(false); toggleVisibility(); }}>
                <img title='Rough Sheet' src={roughsheet} className='cal-btn' style={{ width: '13px', height: '13px' }} />
            </a>
            )}
            

            {isVisible && (
                <div className="overlay">
                    {isCalculator ? (
                        <Draggable>
                        <div className="modal" style={{ backgroundColor: "transparent" }}>
                            <div className="calculator">
                                <div className="display">
                                    <span className='sci__header'><img title='Calculator' src={calculator}   style={{ width: '20px', height: '20px',marginTop:"-3px" }} />&nbsp;Calculator</span>
                                    <input type="text" value={input} readOnly />
                                    <div className="result">{result}</div>
                                    <span className="close" onClick={() => setIsVisible(false)}>&times;</span>
                                </div>
                                <div className="buttons">
                                    <button onClick={() => handleClick('7')}>7</button>
                                    <button onClick={() => handleClick('8')}>8</button>
                                    <button onClick={() => handleClick('9')}>9</button>
                                    <button onClick={() => handleClick('/')}>÷</button>
                                    <button onClick={() => handleClick('4')}>4</button>
                                    <button onClick={() => handleClick('5')}>5</button>
                                    <button onClick={() => handleClick('6')}>6</button>
                                    <button onClick={() => handleClick('*')}>*</button>
                                    <button onClick={() => handleClick('1')}>1</button>
                                    <button onClick={() => handleClick('2')}>2</button>
                                    <button onClick={() => handleClick('3')}>3</button>
                                    <button onClick={() => handleClick('-')}>-</button>
                                    <button onClick={handleNegPos}>+/-</button>
                                    <button onClick={() => handleClick('0')}>0</button>
                                    <button onClick={() => handleClick('.')}>.</button>
                                    <button onClick={() => handleClick('+')}>+</button>
                                    <button onClick={() => handleClick('%')}>%</button>
                                    <button onClick={handleClear}>C</button>
                                    <button onClick={handleDelete}>Del</button>
                                    <button className='cal-sub' onClick={handleCalculate}>=</button>
                                </div>
                            </div>
                        </div>
                        </Draggable>
                    ) : (
                        <div className="modal">
                            <div className="rough-sheet">
                            <h4><img title='Rough Sheet' src={roughsheet} className='cal-btn' style={{ width: '20px', height: '20px',marginTop:"-3px" }} />&nbsp;Rough Sheet</h4>
                                <span className="close-rough" onClick={() => setIsVisible(false)}>&times;</span>
                                <textarea
                                    value={text}
                                    onChange={handleRoughSheetChange}
                                    rows="15"
                                    cols="65"
                                    placeholder="Type your notes here..."
                                />
                                <p>Letters Remaining: {letterCount}</p>
                                <button onClick={handleRoughSheetSave}>Save</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalculatorAndRoughSheet;
