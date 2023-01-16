from flask import Flask, jsonify, request
from neo4j import GraphDatabase
from dotenv import load_dotenv
import os #provides ways to access the Operating System and allows us to read the environment variables

load_dotenv()


uri = os.getenv('NEO_URI')
user = os.getenv("NEO_USERNAME")
password = os.getenv("NEO_PASSWORD")



app = Flask(__name__)

driver = GraphDatabase.driver(uri, auth=(user, password), database="neo4j")

# GET endpoint to retrieve all employees
@app.route("/employees", methods=["GET"])
def get_employees():
    name = request.args.get('name')
    surname = request.args.get('surname')
    position = request.args.get('position')
    sort = request.args.get('sort')
    order = request.args.get('order')
    order = order if order else ""
    sort = (f"ORDER BY {', '.join([f'e.{attr}' for attr in sort.split(',')])} {order}") if sort else ""
    
    print(sort)

    if name and surname and position:
        query = f"MATCH (e:Employee) WHERE e.name = '{name}' AND e.surname = '{surname}' AND e.position = '{position}' RETURN e, elementId(e) {sort}"
    elif name and surname:
        query = f"MATCH (e:Employee) WHERE e.name = '{name}' AND e.surname = '{surname}' RETURN e, elementId(e) {sort}"
    elif name and position:
        query = f"MATCH (e:Employee) WHERE e.name = '{name}' AND e.position = '{position}' RETURN e, elementId(e) {sort}"
    elif surname and position:
        query = f"MATCH (e:Employee) WHERE e.surname = '{surname}' AND e.position = '{position}' RETURN e, elementId(e) {sort}"
    elif name:
        query = f"MATCH (e:Employee) WHERE e.name = '{name}' RETURN e, elementId(e) {sort}"
    elif surname:
        query = f"MATCH (e:Employee) WHERE e.surname = '{surname}' RETURN e, elementId(e) {sort}"
    elif position:
        query = f"MATCH (e:Employee) WHERE e.position = '{position}' RETURN e, elementId(e) {sort}"
    else:
        query = f"MATCH (e:Employee) RETURN e, elementId(e) {sort}"


    with driver.session() as session:
        result = session.run(query)
        employees = [
            {
                'id': employee['elementId(e)'],
                'name': employee['e']['name'], 
                'surname': employee['e']['surname'], 
                'position': employee['e']['position'], 
                'department': employee['e']['department']
            } 
            for employee in result
        ]
        
        return jsonify(employees)

# POST endpoint to add a new employee
@app.route("/employees", methods=["POST"])
def add_employee():
    name = request.json.get("name")
    surname = request.json.get("surname")
    position = request.json.get("position")
    department = request.json.get("department")
    if not all(val for val in [name, surname, position, department]):
        return jsonify({"message": "Missing required fields"})
    with driver.session() as session:
        check = session.run(f"MATCH (e:Employee) WHERE e.name = '{name}' AND e.surname = '{surname}' RETURN e.name")
        if check.single():
            return jsonify({"message": "employee already exists"})
        session.run("CREATE (e:Employee {name: $name, surname: $surname, position: $position, department: $department}) RETURN e", name=name, surname=surname, position=position, department=department)
    return jsonify({"message": "employee added"})

# PUT endpoint to update an existing employee
@app.route("/employees/<id>", methods=["PUT"])
def update_employee(id):
    name = request.json.get("name")
    surname = request.json.get("surname")
    position = request.json.get("position")
    department = request.json.get("department")
    print(id, department)

    with driver.session() as session:
        session.run("MATCH (e:Employee) WHERE elementId(e) = $id SET e.name = $name, e.surname = $surname, e.position = $position, e.department = $department", id=id, name=name, surname=surname, position=position, department=department)
    return jsonify({"message": "employee updated"})

# DELETE endpoint to delete an existing employee
@app.route("/employees/<id>", methods=["DELETE"])
def delete_employee(id):
    with driver.session() as session:
        session.run("MATCH (e:Employee)-[:MANAGES]->(d:Department) WHERE elementId(e) = $id SET d.manager = NULL", id=int(id))
        session.run("MATCH (e:Employee) WHERE elementId(e) = $id DETACH DELETE e", id=int(id))
    return jsonify({"message": "employee deleted"})

# GET endpoint to retrieve an employee's subordinates
@app.route("/employees/<id>/subordinates", methods=["GET"])
def get_subordinates(id):
    with driver.session() as session:
        result = session.run("MATCH (e:Employee)-[:MANAGES]->(s:Employee) WHERE elementId(e) = $id RETURN s", id=int(id))
    return jsonify([r["s"] for r in result])


@app.route("/employees/<id>/department", methods=["GET"])
def get_employee_department(id):
    with driver.session() as session:
        result = session.run("MATCH (e:Employee)-[:WORKS_IN]->(d:Department) WHERE elementId(e) = $id RETURN d", id=int(id))
    return jsonify(result.single()["d"])

@app.route("/departments", methods=["GET"])
def get_departments():
    with driver.session() as session:
        result = session.run("MATCH (d:Department) RETURN d")
    return jsonify([r["d"] for r in result])


@app.route("/departments/<id>/employees", methods=["GET"])
def get_department_employees(id):
    with driver.session() as session:
        result = session.run("MATCH (e:Employee)-[:WORKS_IN]->(d:Department) WHERE elementId(d) = $id RETURN e", id=int(id))
    return jsonify([r["e"] for r in result])


if __name__ == '__main__':
    app.run()