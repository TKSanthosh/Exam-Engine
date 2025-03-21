import { decodeHtml } from './utils';


const RenderHtmlContent1 = ({ htmlString }) => {
    const decodedHtml = decodeHtml(htmlString);
    return (
        <div dangerouslySetInnerHTML={{ __html: decodedHtml }} />
    );
};

export default RenderHtmlContent1;