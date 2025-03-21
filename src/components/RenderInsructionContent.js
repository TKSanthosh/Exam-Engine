import { decodeHtml } from "./utils";
import React from "react";
import ins1 from "./assets/images/ins1.jpg"; 
import ins2 from "./assets/images/ins2.jpg"; 
import ins3 from "./assets/images/ins3.jpg"; 
import ins4 from "./assets/images/ins4.jpg"; 
import ins5 from "./assets/images/ins4.jpg"; 
import ins6 from "./assets/images/ins4.jpg"; 
import ins3_1 from "./assets/images/ins3_1.jpg"; 
import ins4_1 from "./assets/images/ins4_1.jpg"; 
import ins5_1 from "./assets/images/ins4_1.jpg"; 
import ins6_1 from "./assets/images/ins4_1.jpg"; 
import ins_c1 from "./assets/images/ins_c1.jpg"; 
import ins_c2 from "./assets/images/ins_c2.jpg"; 
import ins_c3 from "./assets/images/ins_c3.jpg"; 
import ins_c4 from "./assets/images/ins_c4.jpg"; 


import brokenImage from "./assets/images/broken.gif"; // Add a placeholder for broken images

const imageMap = {
  "ins1.jpg": ins1,
  "ins2.jpg": ins2,
  "ins3.jpg": ins3,
  "ins4.jpg": ins4,
  "ins5.jpg": ins5,
  "ins6.jpg": ins6,
  "ins3_1.jpg": ins3_1,
  "ins4_1.jpg": ins4_1,
  "ins5_1.jpg": ins5_1,
  "ins6_1.jpg": ins6_1,
  "ins_c1.jpg": ins_c1,
  "ins_c2.jpg": ins_c2,
  "ins_c3.jpg": ins_c3,
  "ins_c4.jpg": ins_c4,
  "broken.gif": brokenImage,  // Placeholder for broken images
};


const RenderInstructionContent = ({ htmlString }) => {
  // Decode HTML entities (fixes &quot; issue)
  const decodedHtml = decodeHtml(htmlString);

  // Replace [img] tags with <img> elements
  const formattedHtml = decodedHtml.replace(/\[img\](.*?)\[\/img\]/g, (match, imageName) => {
    const imageSrc = imageMap[imageName.trim()] || brokenImage; // Use brokenImage if not found

    return `
      <img 
        src="${imageSrc}" 
        alt="${imageName}" 
        style="max-width: 10%; height: 20px;" 
        onerror="this.onerror=null;this.src='${brokenImage}';" 
      />
    `;
  });

  return <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />;
};

export default RenderInstructionContent;
