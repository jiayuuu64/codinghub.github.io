from flask import Flask, request, jsonify
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from pymongo import MongoClient
import os

app = Flask(__name__)
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# ✅ MongoDB connection
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client.get_database()  # use DB from URI
quiz_collection = db.final_quiz_scores  # or name it something clearer

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    score = data.get('score')
    course = data.get('courseTitle')
    email = data.get('email')  # make sure to pass this from frontend too

    # ✅ Store quiz attempt in DB
    if email and score is not None:
        quiz_collection.insert_one({
            "email": email,
            "course": course,
            "score": score
        })

    template = PromptTemplate.from_template("""
    A student completed a {course} quiz and scored {score}/15.
    Recommend 3 helpful follow-up videos, articles, or tips for this student.
    Format with bullet points and keep it friendly.
    """)
    
    prompt = template.format(course=course, score=score)
    model = ChatOpenAI(temperature=0.7)
    response = model.invoke(prompt)

    return jsonify({'recommendations': response})

if __name__ == "__main__":
    app.run(port=5005)
