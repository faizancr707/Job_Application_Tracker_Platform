import { setsavedJobs } from '@/redux/authSlice';
import { USER_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetSavedJobs = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                if (user) {
                    const res = await axios.get(`${USER_API_END_POINT}/savedjob`, {
                        withCredentials: true,
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Expires': '0',
                        }
                    });
                    if (res.data.success) {
                        dispatch(setsavedJobs(res.data.savedJobs));
                    }
                }
            } catch (error) {
                console.error('Error fetching saved jobs:', error);
            }
        };
        fetchSavedJobs();
    }, [dispatch, user]);
};

export default useGetSavedJobs;
