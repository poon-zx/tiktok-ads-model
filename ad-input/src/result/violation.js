import react, {useEffect} from 'react';

const Violation = ({data}) => {
    useEffect(() => {
        console.log("this is the output" + data);
    }, [data]);

    return (
        <>
            <h1>Violation Type</h1>
            <h2>{data.a}</h2>
        </>
    );
}

export default Violation;