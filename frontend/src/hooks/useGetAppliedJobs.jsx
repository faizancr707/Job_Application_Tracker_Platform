
import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
                    withCredentials: true,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    }
                });

                const applications = res.data.applications || res.data.application || [];
                dispatch(setAllAppliedJobs(applications));

            } catch (error) {
                console.error("Error fetching applied jobs:", error);
            }
        }
        fetchAppliedJobs();
    }, [dispatch])
};
export default useGetAppliedJobs;