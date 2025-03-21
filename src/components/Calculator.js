import React, { useState } from 'react';
import { evaluate } from 'mathjs';
import './Calculator.css'; // Ensure this path is correct
import calculator from './assets/images/calculator.png';
import roughsheet from './assets/images/pencil.png';
import Draggable from "react-draggable";

const CalculatorAndRoughSheet = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [isCalculator, setIsCalculator] = useState(true);
    const [text, setText] = useState('');
    const [letterCount, setLetterCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

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
        const newLetterCount = newText.replace(/\s+/g, '').length; // Count non-space characters

        if (letterCount < 30000) {
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
                    membership_no: '12312321',
                    question_paper_no: 2,
                    subject_code: 101,
                    exam_date: '2024-08-25',
                    text: text
                }),
            });
            console.log('Res',response);
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
             
             <a  onClick={() => { setIsCalculator(true); toggleVisibility(); }}><img src={calculator} className='cal-btn' style={{ width: '20px', height: '20px' }} /></a>
             <a  onClick={() => { setIsCalculator(false); toggleVisibility(); }}><img src={roughsheet} className='cal-btn' style={{ width: '20px', height: '20px' }} /></a>

            {isVisible && (
                <div className="overlay">
                 
                    {isCalculator ? (
                        <div className="modal">
         
                        
                        <div className="calculator">
                            <div className="display">
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
                    ) : (
                        <div className="modal">
                        <div className="rough-sheet">
                            <h2>Rough Sheet</h2><span className="close-rough" onClick={() => setIsVisible(false)}>&times;</span>
                            <textarea
                                value={text}
                                onChange={handleRoughSheetChange}
                                rows="15"
                                cols="65"
                                placeholder="Type your notes here..."
                            />
                            <p>Letter Count: {letterCount}/30000</p>
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
