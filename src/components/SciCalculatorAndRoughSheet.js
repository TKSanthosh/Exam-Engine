import React, { useState, useEffect } from 'react';
import { evaluate } from 'mathjs';
import './SciCalculatorAndRoughSheet.css';
import calculator from './assets/images/scientific-calculator.png';
import roughsheet from './assets/images/pencil.png';
import { convertDate } from './utils';

const SciCalculatorAndRoughSheet = ({ MembershipNo, QuestionPNo, SubjectCode, ExamDate }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('0');
    const [isCalculator, setIsCalculator] = useState(true);
    const [text, setText] = useState('');
    const [letterCount, setLetterCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [showHelp, setShowHelp] = useState(false); // State to toggle help document visibility
    

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
        setResult('0');
    };

    const handleCalculate = () => {
        try {
            console.log("Evaluating:", input); // Debugging
            const evalResult = evaluate(input);
            setResult(evalResult);
        } catch (error) {
            console.error("Calculation error:", error); // Log error details
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
    const toggleHelp = () => setShowHelp(!showHelp); // Toggle the Help document

    return (
        <div>
            <a onClick={() => { setIsCalculator(true); toggleVisibility(); }}>
                <img title='Scientific Calculator' src={calculator} className='cal-btn' style={{ width: '15px', height: '15px' }} />
            </a>
            <a onClick={() => { setIsCalculator(false); toggleVisibility(); }}>
                <img title='Rough Sheet' src={roughsheet} className='cal-btn' style={{ width: '13px', height: '13px' }} />
            </a>

            {isVisible && (
                <div className="overlay">
                    {isCalculator ? (
                        <div className="sci__modal">
                            <div className="sci__calculator">
                                <div className="sci__display" style={{height:"0px"}}>
                                     <span className='sci__header'><img title='Scientific Calculator' src={calculator}  style={{ width: '20px', height: '20px',marginTop:"-4px" }} />&nbsp;Scientific Calculator</span>
                                    <span className="sci__help-btn" onClick={toggleHelp}>
                                        {showHelp ? 'Back' : 'Help'} 
                                    </span>
                                    <span className="sci__close" onClick={() => setIsVisible(false)}>&times;</span>
                                    {/* <button className="help-btn" onClick={toggleHelp}>Help</button>   */}
                                </div>
                                {showHelp && (
                                    <div className="help-document">
                                          <h4 style={{ textAlign: "center" }}><strong>Calculator Instructions</strong></h4>
                                            Allows you to perform basic and complex mathematical operations such as modulus, square root, cube root, trigonometric, exponential, logarithmic, hyperbolic functions, etc. 
                                            <br /> You can operate the calculator using the buttons provided on screen with your mouse.
                                            <br /><br />
                                            <h5 style={{ textDecoration: "underline", color: "green" }}>Do's:</h5>
                                            <ul>
                                                <li> Be sure to press [C] when beginning a new calculation.</li>
                                                <li> Simply an equation using parenthesis and other mathematical operators.</li>
                                                <li> Use the predefined operations such as p (Pi), log, Exp to save time during calculation.</li>
                                                <li> Use memory function for calculating cumulative totals.</li>
                                                <strong>
                                                    [M+]: Will add displayed value to memory.
                                                    <br />
                                                    [MR]: Will recall the value stored in memory.
                                                    <br />
                                                    [M-]: Subtracts the displayed value from memory.
                                                </strong>
                                                <li> Be sure to select the angle unit (Deg or Rad) before beginning any calculation.</li>
                                                <strong>Note: By default angle unit is set as Degree</strong>
                                            </ul>
                                            <h5><span style={{ textDecoration: "underline", color: "red" }}>Dont's:</span></h5>
                                            <ul>
                                                <li> Perform multiple operations together.</li>
                                                <li> Leave parenthesis unbalanced.</li>
                                                <li> Change the angle unit (Deg or Rad) while performing a calculation.</li>
                                            </ul>
                                            <h5><span style={{ textDecoration: "underline" }}>Limitations:</span></h5>
                                            <ul>
                                                <li> Keyboard operation is disabled.</li>
                                                <li> The output for a Factorial calculation is precise up to 14 digits.</li>
                                                <li> The output for Logarithmic and Hyperbolic calculations is precise up to 5 digits.</li>
                                                <li> Modulus (mod) operation performed on decimal numbers with 15 digits would not be precise.</li>
                                                <strong> Use mod operation only if the number comprises of less than 15 digits i.e. mod operation provides best results for smaller numbers.</strong>
                                                <li>The range of value supported by the calculator is 10(-323) to 10(308).</li>
                                            </ul>
                                            <br /><br />
                                         
                                    </div>
                                )}
                                {!showHelp && ( /* Hide calculator buttons when Help is visible */
                                <>
                                    <div className="sci__display">
                                        <input type="text" value={input} readOnly />
                                        <div className="sci__result">{result}</div>
                                    </div>
                                    <div className="sci__buttons">
                                    <button className='sci__btn' onClick={() => handleClick('sin(')}>sin</button>
                                            <button className='sci__btn' onClick={() => handleClick('cos(')}>cos</button>
                                            <button className='sci__btn' onClick={() => handleClick('tan(')}>tan</button>
                                        <button onClick={() => handleClick('7')}>7</button>
                                        <button onClick={() => handleClick('8')}>8</button>
                                        <button onClick={() => handleClick('9')}>9</button>
                                        <button onClick={() => handleClick('/')}>÷</button>
                                        <button className='sci__btn' onClick={() => handleClick('sinh(')}>sinh</button>
                                            <button className='sci__btn' onClick={() => handleClick('cosh(')}>cosh</button>
                                            <button className='sci__btn' onClick={() => handleClick('tanh(')}>tanh</button>
                                        <button onClick={() => handleClick('4')}>4</button>
                                        <button onClick={() => handleClick('5')}>5</button>
                                        <button onClick={() => handleClick('6')}>6</button>
                                        <button onClick={() => handleClick('*')}>*</button>
                                        <button className='sci__btn' onClick={() => handleClick('asin(')}>asin</button> 
                                            <button className='sci__btn' onClick={() => handleClick('acos(')}>acos</button>
                                            <button className='sci__btn' onClick={() => handleClick('atan(')}>atan</button>
                                        <button onClick={() => handleClick('1')}>1</button>
                                        <button onClick={() => handleClick('2')}>2</button>
                                        <button onClick={() => handleClick('3')}>3</button>
                                        <button onClick={() => handleClick('-')}>-</button>
                                        <button className='sci__btn' onClick={() => handleClick('asinh(')}>asinh</button>
                                            <button className='sci__btn' onClick={() => handleClick('acosh(')}>acosh</button>
                                            <button className='sci__btn' onClick={() => handleClick('atanh(')}>atanh</button>
                                        <button onClick={handleNegPos}>+/-</button>
                                        <button onClick={() => handleClick('0')}>0</button>
                                        <button onClick={() => handleClick('.')}>.</button>
                                        <button onClick={() => handleClick('+')}>+</button>
                                        <button className='sci__btn'  onClick={() => handleClick('log(')}>log</button> 
                                            <button className='sci__btn'  onClick={() => handleClick('pi')}>π</button> 
                                        <button className='sci__btn'  onClick={() => handleClick('exp(')}>Exp</button>

                                        <button onClick={() => handleClick('%')}>%</button>
                                        <button onClick={() => handleClick('(')}>(</button>
                                            <button onClick={() => handleClick(')')}>)</button>
                                        

                                        <button onClick={handleClear} style={{backgroundColor:"rgb(181 181 181)"}}>C</button>
                                            
                                            
                                            <button className='sci__btn'  onClick={() => handleClick('e')}>e</button> 
                                            {/* Logarithm base 10 */}
                                            <button className='sci__btn'  onClick={() => handleClick('!')}>x!</button>
                                            <button className='sci__btn'  onClick={() => handleClick('^')}>^</button> {/* Exponentiation */}
                                            <button className='sci__btn'  onClick={() => handleClick('^2')}>x²</button>  
                                             <button className='sci__btn'  onClick={() => handleClick('^3')}>x<sup>3</sup></button>
                                        <button onClick={handleDelete}>Del</button>
                                        <button className='sci__cal-sub' onClick={handleCalculate}>=</button>

                                            
                                        {/* </div> */}
                                    </div>
                                    </>)}
                            </div>
                        </div>
                    ) : (
                        <div className="sci__modal">
                            <div className="sci__rough-sheet">
                                <h4><img title='Rough Sheet' src={roughsheet} className='cal-btn' style={{ width: '20px', height: '20px',marginTop:"-3px" }} />&nbsp;Rough Sheet</h4>
                                <span className="sci__close-rough" onClick={() => setIsVisible(false)}>&times;</span>
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

export default SciCalculatorAndRoughSheet;
