from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import io

# --- IMPORT YOUR MODEL HERE ---
# If you saved your model using pickle/joblib:
# import joblib
# model = joblib.load('my_trained_model.pkl')

app = Flask(__name__)
CORS(app) # Allow Next.js to talk to this server

def extract_text_from_pdf(file_stream):
    reader = PyPDF2.PdfReader(file_stream)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 1. Get the uploaded file and required skills
        if 'cv' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
            
        file = request.files['cv']
        required_skills_string = request.form.get('required_skills', '')
        
        # 2. Extract Text from PDF
        cv_text = extract_text_from_pdf(file)
        
        # 3. YOUR MODEL LOGIC GOES HERE 
        # This is where you paste the logic from your Jupyter Notebook.
        # For this example, I am writing a logic to check matches.
        
        # Normalize text (lowercase)
        cv_text_lower = cv_text.lower()
        
        # Convert comma-separated string to list
        required_skills_list = [s.strip().lower() for s in required_skills_string.split(',') if s.strip()]
        
        missing_skills = []
        
        # --- LOGIC: Check if skill exists in CV ---
        # (Replace this loop with your actual Model prediction if it's more complex)
        for skill in required_skills_list:
            if skill not in cv_text_lower:
                missing_skills.append(skill.title()) # Add to missing list

        # 4. Return result
        return jsonify({
            'success': True,
            'missing_skills': missing_skills,
            'score': len(required_skills_list) - len(missing_skills) # Example score
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)