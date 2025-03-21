import React from "react";
import QuestionImage from "./QuestionImage";

const QPView = () => {
  return (
    <div>
      <QuestionImage questionId={1} />
      <hr />
      <QuestionImage questionId={"Photo"} />
    </div>
  );
};

export default QPView;
