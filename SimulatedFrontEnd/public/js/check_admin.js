var role = localStorage.getItem("role_name");
if(role!="admin"){
    location.replace("../error.html")
}