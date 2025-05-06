import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const generateEnergyAuditPDF = (categories) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.text("Energy Audit Checklist", 20, 20);
    
    // Introduction Section
    doc.setFontSize(16);
    doc.text("ELECTRICAL INSPECTION CHECKLIST", 20, 40);
    doc.setFontSize(12);
    doc.text("Date: ____________________", 20, 50);
    doc.text("Inspector: ____________________", 20, 55);
    doc.text("Location: ____________________", 20, 60);
    doc.text("Comments: ____________________", 20, 65);

    // Assessment of Old Building
    Object.keys(categories).forEach((floor, index) => {
        doc.setFontSize(14);
        doc.text(`Assessment of Old Building ${floor}`, 20, 80 + (index * 10));
        
        autoTable(doc, {
            head: [['Item No.', 'Category', 'Conditions', 'Reference Standards', 'Completed', 'Risk Index']],
            body: categories[floor].map((category, catIndex) => [
                catIndex + 1,
                category,
                "Size of Wires, Protection, Electrical Outlet, Lighting",
                "PEC Article 3, PEC Article 2.40, PEC Article 3.0.1.14-15, PEC Article 3",
                "Yes / No",
                "5 - Frequent"
            ]),
            startY: doc.autoTable.previous.finalY + 10,
        });
    });

    // Save the PDF
    doc.save("Energy_Audit_Checklist.pdf");
};

export default generateEnergyAuditPDF;
