import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";

export const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
    const { authToken } = useContext(UserContext);
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);

    const [onChange, setOnChange] = useState(true)



//   ===============Categories============
  useEffect(() => {
    fetch("http://127.0.0.1:5000/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    })
      .then((res) => res.json())
      .then((response) => {
        setCategories(response);
      })
      .catch((error) =>
        console.error("Error fetching categories:", error)
      );
  }, [authToken]);



   // ==> Delete Category (by name)
    const deleteCategory = (categoryName) => {
        toast.loading("Deleting Category...");

        fetch(`http://127.0.0.1:5000/categories/name/${encodeURIComponent(categoryName)}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((resp) => resp.json())
            .then((response) => {
                toast.dismiss();

                if (response.message) {
                    toast.success(response.message);
                    setOnChange(!onchange); 
                } else {
                    toast.error(response.error || "Failed to delete category");
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error("Error deleting category");
                console.error("Delete Category Error:", error);
            });
    };


    // ==> Add Category
    const addCategory = (name) => {
        toast.loading("Adding Category...");

        fetch("http://127.0.0.1:5000/category", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name }),
        })
            .then((resp) => resp.json())
            .then((response) => {
                toast.dismiss();

                if (response.success) {
                    toast.success(response.success);
                    setOnChange(!onChange); // refresh categories
                } else if (response.error) {
                    toast.error(response.error);
                } else {
                    toast.error("Failed to add category");
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error("Error adding category");
                console.error("Add Category Error:", error);
            });
    };


    // ==> Update Category by Name
    const updateCategory = (currentName, newName) => {
        toast.loading("Updating Category...");

        fetch(`http://127.0.0.1:5000/category/name/${encodeURIComponent(currentName)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name: newName }), // send new data
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();

            if (response.success) {
                toast.success(response.success);
                setOnChange(!onChange); // refresh categories
                // Optional: navigate somewhere
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to update category");
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error("Error updating category");
            console.error("Update Category Error:", error);
        });
    };


    // ==================Services=====================
    useEffect(() => {
        fetch("http://127.0.0.1:5000/services", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        })
        .then((res) => res.json())
        .then((response) => {
            setServices(response);
        })
        .catch((error) =>
            console.error("Error fetching services:", error)
        );
    }, [authToken]);


    // Add Service 
    const addService = (title,description,duration_minutes,price,image,category_name) => {
        toast.loading("Adding Service...");

        fetch("http://127.0.0.1:5000/service", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({title,description,duration_minutes,price,image,category_name  }),
        })
            .then((resp) => resp.json())
            .then((response) => {
                toast.dismiss();

                if (response.success) {
                    toast.success(response.success);
                    setOnChange(!onChange); // refresh Services
                } else if (response.error) {
                    toast.error(response.error);
                } else {
                    toast.error("Failed to add service");
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error("Error adding Service");
                console.error("Add Service Error:", error);
            });
    };


    // Fetch Service by ID
    const getServiceById = (service_id) => {
        return fetch(`http://127.0.0.1:5000/service/${service_id}`, {
            method: "GET",
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then((resp) => resp.json())
            .then((response) => {
                if (response.error) {
                    toast.error(response.error);
                    return null;
                }
                return response;
            })
            .catch((error) => {
                toast.error("Failed to fetch Service.");
                console.error(error);
                return null;
            });
    };

    // Update service
    const updateService = (title, description, duration_minutes, price, image, category_name, service_id) => {
        toast.loading("Updating your Service... ");

        fetch(`http://127.0.0.1:5000/services/${service_id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, duration_minutes, price, image, category_name })
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();

            if (response.message) {
                toast.success(response.message);
                setOnChange(!onChange);
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to update service.");
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error("Error updating service.");
            console.error("Update Service Error:", error);
        });
    };


    // Delete  Service
    const deleteService = (service_id) => {
        toast.loading("Deleting Service... ");

        fetch(`http://127.0.0.1:5000/service-del/${service_id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then((resp) => resp.json())
        .then((response) => {
            toast.dismiss();

            if (response.message) {
                toast.success(response.message);
                setOnChange(!onChange);
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("Failed to delete service.");
            }
        })
        .catch((error) => {
            toast.dismiss();
            toast.error("Error deleting service.");
            console.error("Delete Service Error:", error);
        });
    };



  const data ={
    categories,
    services,
    deleteCategory,
    addCategory,
    updateCategory,
    addService,
    getServiceById,
    updateService,
    deleteService
  }
  return (
    <ServiceContext.Provider value={data}>
      {children}
    </ServiceContext.Provider>
  );
};
