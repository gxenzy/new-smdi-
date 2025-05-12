from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams
from io import StringIO
import os

# File paths
pdf_path = r"C:\Users\renzy\Downloads\CODE\New folder\smdi-test1\user-workspace\Electrical_Inspection_Checklists.pdf"
html_path = r"C:\Users\renzy\Downloads\Electrical_Inspection_Checklists.html"

# Setup output stream and layout
output_string = StringIO()
with open(pdf_path, 'rb') as in_file:
    extract_text_to_fp(in_file, output_string, laparams=LAParams(), output_type='html', codec=None)

# Write the HTML content to a file
with open(html_path, 'w', encoding='utf-8') as out_file:
    out_file.write(output_string.getvalue())

print(f"HTML saved to {html_path}")
