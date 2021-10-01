import { useState, useEffect } from 'react';
import axios from 'axios';

const Fib = () => {
    const [index, setIndex] = useState('');
    const [seenIndexes, setSeenIndexes] = useState([]);
    const [values, setValues] = useState({});

    const fetchValues = async () => {
        const newValues = await axios.get('/api/values/current');
        setValues(newValues.data);
    }

    const fetchIndexes = async () => {
        const newIndexes = await axios.get('/api/values/all');
        setSeenIndexes(newIndexes.data);
    }

    useEffect(() => {
        fetchValues();
        fetchIndexes();
    }, []);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        await axios.post('/api/values', {
            index,
        });

        setIndex('');
        fetchValues();
        fetchIndexes();
    }

    const renderValues = () => {
        const entries = [];

        for (let key in values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {values[key]}
                </div>
            );
        }

        return entries;
    }

    return (
        <div>
            <form onSubmit={onSubmitHandler}>
                <label>Enter your index:</label>
                <input
                    value={index}
                    onChange={(event) => setIndex(event.target.value)}
                />
                <button>Submit</button>
            </form>
            <h3>Indexes I have seen:</h3>
            {seenIndexes.map(({ number }) => number).join(', ')}
            <h3>Calculated Values:</h3>
            {renderValues()}
        </div>
    );
}

export default Fib;