const {jsPDF} = require('jspdf');
const path = require('path');

class PdfBuilder {

    static build(config = {}) {
        config.putOnlyUsedFonts = true;
        config.compress = true;
        let doc = new jsPDF(config);
        let filePath = path.dirname(__dirname) + path.sep + '/utils/font/MiSans-Normal.ttf';
        doc.addFont(filePath, 'misans', 'normal');
        doc.setFont('misans', 'normal')
        return doc;
    }
}

module.exports = PdfBuilder