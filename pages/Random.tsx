import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jikanApi } from '../services/api';
import { Loading } from '../components/Loading';

export const Random = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRandom = async () => {
            try {
                const res = await jikanApi.getRandomAnime();
                if (res.data?.mal_id) {
                    navigate(`/anime/${res.data.mal_id}`, { replace: true });
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchRandom();
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loading />
            <p className="text-slate-400 animate-pulse">Rolling the dice...</p>
        </div>
    );
};
