from flask import Flask, request, jsonify
import pandas as pd
import random

app = Flask(__name__)

# 1. Load the CSV Data
try:
    # We read the CSV once when the server starts
    df = pd.read_csv("it_interview_questions_5000.csv")
    
    # Clean up column names (remove spaces)
    df.columns = [c.strip() for c in df.columns]
    
    print("✅ CSV Loaded Successfully!")
    print(f"   - Total Questions: {len(df)}")
    print(f"   - Job Titles found: {df['job_title'].unique()}")
    print(f"   - Categories found: {df['category'].unique()}")

except Exception as e:
    print(f"❌ Error loading CSV: {e}")
    df = pd.DataFrame() # Create empty if failed

@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        job_position = data.get('jobPosition')  # e.g., "Frontend Developer"
        job_desc = data.get('jobDescription')   # (Optional - used for keyword matching if needed)
        types = data.get('type')                # e.g., ["Behavioral", "Technical"]
        count = int(data.get('questionCount', 5))

        print(f"📩 Request: {job_position} | Types: {types} | Count: {count}")

        selected_questions = []

        # 2. Filter by Job Title
        # We try to find exact matches, or loose matches (e.g., "Developer" in "Frontend Developer")
        job_matches = df[df['job_title'].str.contains(job_position, case=False, na=False)]
        
        # If no exact match, fallback to generic questions or try partial match
        if job_matches.empty:
            print(f"   ⚠️ No specific questions for '{job_position}'. Using general pool.")
            job_matches = df 

        # 3. Filter by Question Types (Categories)
        # We divide the total count among the selected types
        questions_per_type = count // len(types) if types else count
        remainder = count % len(types) if types else 0

        for q_type in types:
            # Filter specifically for this category (e.g., 'Behavioral')
            type_matches = job_matches[job_matches['category'].str.contains(q_type, case=False, na=False)]
            
            # If we don't have enough specific type questions, fall back to just the job questions
            if type_matches.empty:
                type_matches = job_matches
            
            # How many to grab for this type?
            num_to_grab = questions_per_type
            if remainder > 0:
                num_to_grab += 1
                remainder -= 1
            
            # Randomly sample the questions
            if not type_matches.empty:
                # Get random sample, but don't crash if we ask for more than available
                sample_size = min(len(type_matches), num_to_grab)
                found = type_matches.sample(n=sample_size)['question'].tolist()
                selected_questions.extend(found)

        # 4. Final Safety Check
        # If we still don't have enough questions (or no types were selected), fill up randomly from job matches
        while len(selected_questions) < count:
            remaining_needed = count - len(selected_questions)
            if not job_matches.empty:
                extra = job_matches.sample(n=1)['question'].iloc[0]
                if extra not in selected_questions:
                    selected_questions.append(extra)
            else:
                selected_questions.append("Describe your experience relevant to this role.") # Ultimate fallback

        # Trim if we somehow got too many
        final_result = selected_questions[:count]

        return jsonify({"questions": final_result, "success": True})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001
    app.run(port=5001, debug=True)