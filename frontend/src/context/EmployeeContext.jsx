import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../api/Cloudinary"



export const EmployeeContext = createContext();


export const EmployeeProvider = ({children}) => {
    const {authToken} = useContext(UserContext);
    const [allergies, setAllergies] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [employee, setEmployee] = useState(null);

    const [onChange, setOnChange] = useState(true);




    // =========Allergies========
    useEffect(() => {
        if (!authToken) return;

        fetch("http://127.0.0.1:5000/allergies", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
        .then((res) => res.json())
        .then((response) => {
            setAllergies(response);
        })
        .catch((error) =>
            console.error("Error fetching allergies:", error)
        );
    }, [authToken, onChange]);



    // ==> Delete Allergy
    const deleteallergy = (allergy_id) => {
        toast.loading("Deleting Allergy...");

        fetch(`http://127.0.0.1:5000/allergy/${allergy_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((resp) => resp.json())
            .then((response) => {
                toast.dismiss();

                if (response.success) {
                    toast.success(response.success);
                    setOnChange(!onChange); 
                } else {
                    toast.error(response.error || "Failed to delete allergy");
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error("Error deleting allergy");
                console.error("Delete Allergy Error:", error);
            });
    };


    // ==> Add Allergy
    const addAllergy = async (name) => {
        toast.loading("Adding Allergy...");

        try {
            const resp = await fetch("http://127.0.0.1:5000/allergy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name }),
            });

            const data = await resp.json();
            toast.dismiss();

            if (!resp.ok) {
            toast.error(data.error || "Failed to add allergy");
            return;
            }

            toast.success(data.success);
            setOnChange((prev) => !prev); // refresh

        } catch (error) {
            toast.dismiss();
            toast.error("Network error");
            console.error("Add Allergy Error:", error);
        }
    };

    // ==> Update Allergy
    const updateAllergy = (name, allergy_id) => {
        toast.loading("Updating Allergy...");

        fetch(`http://127.0.0.1:5000/allergies/${allergy_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name, allergy_id }), // send new data
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();

            if (response.success) {
                toast.success(response.success);
                setOnChange(!onChange);
                // Optional: navigate somewhere
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to update allergy");
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error("Error updating allergy");
            console.error("Update Allergy Error:", error);
        });
    };


    // =================UpComing Appointments=========
    const fetchUpcomingAppointments = async () => {
        if (!authToken) return;

        const toastId = toast.loading("Fetching upcoming appointments...");

        try {
            const res = await fetch(
                "http://127.0.0.1:5000/reminders/my-upcoming",
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.error || "Failed to fetch upcoming appointments"
                );
            }

            setUpcomingAppointments(data.appointments || []);

            toast.update(toastId, {
                render: "Appointments updated",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
            setOnChange(!onChange);

        } catch (err) {
            console.error("Reminder fetch error:", err);

            setUpcomingAppointments([]);

            toast.update(toastId, {
                render: err.message || "Something went wrong",
                type: "error",
                isLoading: false,
                autoClose: 4000,
            });
        }
    };


    // Auto-fetch on login
    useEffect(() => {
        fetchUpcomingAppointments();
    }, [authToken]);


    // ==============Employee============
    const fetchMyEmployeeProfile = async () => {
        if (!authToken) return;

        const toastId = toast.loading("Fetching employee profile...");

        try {
            const res = await fetch("http://127.0.0.1:5000/employee-profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            });

            const data = await res.json();

            if (!res.ok) {
            throw new Error(data.error || "Failed to fetch employee profile");
            }

            setEmployee(data.employee);

            toast.update(toastId, {
                render: "Employee profile loaded",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });
        } catch (err) {
            console.error("Fetch Employee Error:", err);

            toast.update(toastId, {
                render: err.message || "Failed to fetch employee profile",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } 
    };

    // Auto-fetch when token becomes available
    useEffect(() => {
        fetchMyEmployeeProfile();
    }, [authToken]);


    
    // =========Update========
    const updateEmployeeProfile = async (imageFile) => {
        toast.loading("Updating Profile Picture...");
        
        try {
            let imageUrl = null;

            if (imageFile) {
                const upload = await uploadToCloudinary(imageFile);
                imageUrl = upload.secure_url;
            }
            
            const response = await fetch("http://127.0.0.1:5000/employee/profile-picture", {
                method: "PUT", 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    employee_profile_picture: imageUrl
                })
            });

            const data = await response.json();
            
            toast.dismiss();

            if (response.ok) {
                // Update employee state with the returned employee object
                setEmployee(prevEmployee => ({
                    ...prevEmployee,
                    ...data.employee
                }));
                toast.success(data.message || "Profile picture updated successfully!");
            } else {
                toast.error(data.error || "Failed to update profile picture.");
            }
        } catch (error) {
            toast.dismiss();
            console.error("Update profile picture error:", error);
            toast.error("An error occurred: " + error.message);
        }
    };
    
    




    const data = {
        allergies,
        deleteallergy,
        addAllergy,
        updateAllergy,
        setAllergies,
        upcomingAppointments,
        employee,
        updateEmployeeProfile

      
    }

    return (
        <EmployeeContext.Provider value={data}>
            {children}
        </EmployeeContext.Provider>
    )

}