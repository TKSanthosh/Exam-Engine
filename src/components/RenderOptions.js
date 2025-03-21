import React from "react";
import QuestionImage from "./QuestionImage"; // Assuming you have this component
import { decodeHtml } from "./utils";

const RenderOptions = ({ htmlString }) => {
  const processHtmlString = (decodedHtml) => {
    const regExp = /\[img\](.*?)\[\/img\]/g;
    const elements = [];
    let lastIndex = 0;

    // Replace matches and construct JSX elements
    decodedHtml.replace(regExp, (match, p1, offset) => {
      // Extract the text inside the [img]...[/img] tag
      const totalString = p1.split(".");
      const imageName = totalString[0];
      console.log("Text inside [img] tags:", imageName);

      // Push text before the match as raw HTML
      const textBefore = decodedHtml.slice(lastIndex, offset);
      if (textBefore.trim()) {
        elements.push(
          <span
            key={`text-${lastIndex}`}
            dangerouslySetInnerHTML={{ __html: textBefore }}
          />
        );
      }

      // Push the QuestionImage component
      elements.push(
        <QuestionImage key={`img-${offset}`} questionId={imageName} />
      );

      lastIndex = offset + match.length;
      return match;
    });

    // Add any remaining text after the last match as raw HTML
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

  return (
    <div style={{ marginLeft: "1.6rem", marginTop: "-1.4rem" }}>
      {processedContent}
    </div>
  );
};

export default RenderOptions;
