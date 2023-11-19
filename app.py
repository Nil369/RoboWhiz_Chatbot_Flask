from flask import Flask, render_template , request , redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///intents.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Todo(db.Model):
    sno = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    desc = db.Column(db.String(1000), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"{self.Slno} - {self.title}"



# app.py

# ... (your existing imports and code)

@app.route("/get_intents", methods=['GET'])
def get_intents():
    user_message = request.args.get('user_message', '').lower()

    if user_message:
        # If user_message is provided, filter intents based on user_message
        intents = Todo.query.filter(Todo.title.ilike('%{}%'.format(user_message))).all()
    else:
        # If no user_message, fetch all intents
        intents = Todo.query.all()

    intents_data = [{'desc': intent.desc} for intent in intents]
    return jsonify(intents_data)


@app.route("/")
def chatbot_home():
    return render_template("chatbot.html")


@app.route("/about")
def about():
    return render_template('about.html')


@app.route("/intents", methods = ['GET','POST'])
def home():
    if request.method == 'POST':
        title_1 = request.form['title']
        desc_1 = request.form['desc']
        todo = Todo(title = title_1, desc = desc_1)
        db.session.add(todo)
        db.session.commit()
    allTodo = Todo.query.all()
    return render_template('intents.html', allTodo=allTodo)



@app.route("/update/<int:sno>", methods = ['GET','POST'])
def update(sno):
    if request.method == 'POST':
        title_1 = request.form['title']
        desc_1 = request.form['desc']
        todo = Todo.query.filter_by(sno=sno).first()
        todo.title = title_1
        todo.desc = desc_1
        db.session.add(todo)
        db.session.commit()
        return redirect('/intents')
    todo = Todo.query.filter_by(sno=sno).first()
    return render_template('update_intents.html', todo=todo)

@app.route("/delete/<int:sno>")
def delete(sno):
    todo = Todo.query.filter_by(sno=sno).first()
    db.session.delete(todo)
    db.session.commit()
    return redirect("/intents")

if __name__ == "__main__":
    
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=6969)



