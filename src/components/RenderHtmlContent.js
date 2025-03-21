import React from "react";
import { decodeHtml } from "./utils";
import QuestionImage from "./QuestionImage";
import "./Exam.css"
const RenderHtmlContent = ({ htmlString, caseId, caseText, questionType,incrementingId,renderedOptions }) => {
  const processHtmlString = (decodedHtml) => {
    const regExp = /\[img\](.*?)\[\/img\]/g;
    const elements = [];
    let lastIndex = 0;

    // Process matches and construct JSX elements
    decodedHtml.replace(regExp, (match, p1, offset) => {
      const totalString = p1.split(".");
      const imageName = totalString[0];
      console.log("Text inside [img] tags:", imageName);

      // Push text before the current match as raw HTML
      const textBefore = decodedHtml.slice(lastIndex, offset);
      if (textBefore.trim()) {
        elements.push(
          <span
            key={`text-${lastIndex}`}
            dangerouslySetInnerHTML={{ __html: textBefore }}
          />
        );
      }

      // Push the QuestionImage component with the extracted image name
      elements.push(
        <QuestionImage key={`img-${offset}`} questionId={imageName} />
      );

      lastIndex = offset + match.length;
      return match;
    });

    // Handle any remaining text after the last match
    const textAfter = decodedHtml.slice(lastIndex);
    if (textAfter.trim()) {
      elements.push(
        <span
          key={`text-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: textAfter }}
        />
      );
    }

    return elements;
  };

  const decodedHtml = decodeHtml(htmlString);
  const processedContent = processHtmlString(decodedHtml);
  const decodedCaseHtml = decodeHtml(caseText);
  const processedCaseContent = processHtmlString(decodedCaseHtml);

  const hrStyle = {
    border: "none",
    borderTop: "3px solid black",
    width: "100%",
  };

  return (
    <>
    {questionType === "DQ" ? (
      <div>
        <div style={{ marginLeft: "26px", marginTop: "-24px" }} className={`ques${incrementingId}`} id={`desc${incrementingId}`}>
          {processedContent}
        </div>
      </div>
    ) : caseId > 0 ? (
      <div className="container">
      <div className="row" style={{ marginTop: "-24px" }}>
        {/* Left Side - processedCaseContent */}
        <div
          className="col-12 col-md-5"
          style={{ maxHeight: "200px", height: "150px", overflowY: "auto" }}
        >
          <div style={{ marginLeft: "26px" }} className={`case${caseId}`}>
            {processedCaseContent}
          </div>
        </div>
        <hr style={{ width: "2px", backgroundColor: "black", border: "none" }} />
        {/* Right Side - processedContent */}
        <div className="col-12 col-md-5">
          <div style={{ marginLeft: "26px" }} className={`ques${incrementingId}`}>
            {processedContent}
            {renderedOptions}
          </div>
        </div>
      </div>
      
    </div>
    
    ) : (
      <div style={{ marginLeft: "26px", marginTop: "-24px" }} className={`ques${incrementingId}`}>
        {processedContent}
        {renderedOptions}
      </div>
    )}
  </>

  );
};



export default RenderHtmlContent;
