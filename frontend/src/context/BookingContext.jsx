import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";




export const BookingContext = createContext();

export const BookingProvider = ({children}) => {
    const {authToken} = useContext(UserContext);
    const [slots, setSlots] = useState({morning: [],afternoon: [],evening: [],});
    const [serviceId, setServiceId] = useState(null);
    const [date, setDate] = useState(null);
    const [bookingPreview, setBookingPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewError, setPreviewError] = useState(null);
    const [appointments, setAppointments] = useState([])
    const navigate = useNavigate()


    const [onChange, setOnChange] = useState(true)

    

    // ========== Slots===============
    useEffect(() => {
        if (!serviceId || !date) return;

        fetch(
        `http://127.0.0.1:5000/available-slots?service_id=${serviceId}&date=${date}`,
        {
            headers: {
            Authorization: `Bearer ${authToken}`,
            },
        }
        )
        .then((res) => res.json())
        .then((data) => {
            setSlots(data.slots);
        })
        .catch((err) => console.error("Slot fetch error:", err));
    }, [serviceId, date, authToken]);


    // ==============Booking ==============
    const createBooking = (service_id, date, start_time, employee_id) => {
        fetch("http://127.0.0.1:5000/bookings", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
            service_id,
            date,
            start_time,
            employee_id, // optional, backend handles missing
            }),
        })
            .then((res) => res.json())
            .then((response) => {
            console.log(response);

            if (response.message) {
                toast.dismiss();
                toast.success(response.message);
                navigate("/thanks");
            } 
            else if (response.error) {
                toast.dismiss();
                toast.error(response.error);
            }
            })
            .catch((err) => {
            toast.dismiss();
            toast.error("Something went wrong");
            console.error(err);
            });
        };

    // ==========Preview================
    const fetchBookingPreview = async ({ serviceId, date, startTime, employeeId = null }) => {
        setPreviewLoading(true);
        setPreviewError(null);

        try {
        // Build query parameters
        const params = new URLSearchParams({
            service_id: serviceId,
            date: date,
            start_time: startTime,
        });

        // Add optional employee_id if provided
        if (employeeId) {
            params.append('employee_id', employeeId);
        }

        const response = await fetch(`http://127.0.0.1:5000/bookings/preview?${params.toString()}`, {
            method: 'GET',
            headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch booking preview');
        }

        const data = await response.json();
        setBookingPreview(data);
        return data;
        } catch (error) {
        console.error('Error fetching booking preview:', error);
        setPreviewError(error.message);
        throw error;
        } finally {
        setPreviewLoading(false);
        }
    };

    /**
     * Clear booking preview data
     */
    const clearBookingPreview = () => {
        setBookingPreview(null);
        setPreviewError(null);
    };


    // ===============Appointmnets=======
    useEffect(() => {
        if (!authToken) return;

        fetch("http://127.0.0.1:5000/bookings", {
            headers: {
            Authorization: `Bearer ${authToken}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
            setAppointments(data);
            })
            .catch((err) => console.error("Error fetching appointments:", err));
        }, [authToken, onchange]);




        // =============Receipt ==========
        const downloadReceipt = async (bookingId) => {
            const toastId = toast.loading("Downloading receipt...");

            try {
                const response = await fetch(
                    `http://localhost:5000/receipts/${bookingId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to download receipt");
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = `receipt-BK${String(bookingId).padStart(6, "0")}.pdf`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(url);

                toast.dismiss(toastId);
                toast.success("Receipt downloaded successfully");
                
                setOnChange(prev => !prev);

                return { success: true };

            } catch (err) {
                toast.dismiss(toastId);
                toast.error(err.message || "Download failed");
                return { success: false, error: err.message };
            }
        };


    const data = {
        slots,
        setServiceId,
        setDate,
        createBooking,
        fetchBookingPreview,
        clearBookingPreview,
        bookingPreview,
        previewError,
        previewLoading,
        appointments,
        setAppointments,
        downloadReceipt
    }

    return (
        <BookingContext.Provider value={data}>
            {children}
        </BookingContext.Provider>
    )
}