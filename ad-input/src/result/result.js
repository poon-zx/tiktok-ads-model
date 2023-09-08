import react, {useEffect} from 'react';
import katex from 'katex';
import { Card } from '@mui/material';
import "./result.css"

const AdScoringSystem = ({data}) => {
    return (
        <>
            <h2>Ad Scoring System</h2>
            <Card className="score-card" variant="outlined" sx={{padding: '20px', marginLeft: '4vw', marginRight: '4vw', borderRadius: '10px'}}>
                <div style={{fontSize: '1.3rem'}}>ad_score = β<sub>1</sub> ​× avg_ad_revenue + β<sub>2​</sub> × baseline_st + β<sub>3</sub> ​× days_diff +  β<sub>4</sub> x advertiser_tier</div>
                <div>confidence : {data.ad_score_equation.confidence}</div>
            </Card>
        </>
    )
}

const AdScoringValue = ({data}) => {
    return (
        <div style={{display:'flex', justifyContent:'center'}}>
        <Card className="score-card" variant="outlined" sx={{marginTop: '2vh', padding: '10px', marginLeft: '4vw', marginRight: '4vw', borderRadius: '10px', width: '40%'}}>
            <div style={{textAlign: 'left'}}>
                <div>ad_score       : {data.ad_score_equation.score}</div>
                <div>avg_ad_revenue : 23.89</div>
                <div>baseline_st    : {data.ad_score_equation.baseline_st}</div>
                <div>days_diff      : {data.ad_score_equation.days_diff}</div>
                <div>advertiser_tier: 6 </div>
            </div>
        </Card>
        </div>
    )
}

const ViolationType = ({data}) => {
    const violations = data.video_violation
    return (
        <>
            <div style={{ textAlign: 'center', margin: '0 4vw' }}>
                <h2>Violation Type</h2>
                <Card className="score-card" variant="outlined" sx={{padding: '20px', marginLeft: '4vw', marginRight: '4vw', borderRadius: '10px'}}>
                    {violations ? Object.keys(violations).map((key) => (
                        <div key={key} >{key} : {violations[key]}</div>
                    )) :
                        <div>No Violations Found</div>
                    }
                </Card>
            </div>
        </>
    )
};

const AdCategory = ({data}) => {
    const categories = data.ad_category
    return (
        <>
            <div style={{ textAlign: 'center', margin: '0 4vw' }}>
                <h2>Ad Category</h2>
                <Card className="score-card" variant="outlined" sx={{padding: '20px', marginLeft: '4vw', marginRight: '4vw', borderRadius: '10px'}}>
                    {Object.keys(categories).map((key) => (
                        <div key={key} >{key} : {categories[key]}</div>
                    ))}
                </Card>
            </div>
        </>
    )
};

const ModeratorMatching = ({data}) => {
    const moderator = data.moderator_matching
    return (
        <>
            <h2>Moderator Matching</h2>
            <Card className="score-card" variant="outlined" sx={{padding: '20px', marginLeft: '4vw', marginRight: '4vw', borderRadius: '10px'}}>
                <div>Ad will be reviewed by moderator {moderator.moderator_id}</div>
                <div>{moderator.market} {moderator.expertise}</div>
                <div>mod_score = β<sub>1</sub> x productivity + β<sub>2</sub> x accuracy</div>
            </Card>
        </>
    )
};

const ModScore = ({data}) => {
    return (
        <div style={{display:'flex', justifyContent:'center'}}>
        <Card className="score-card" variant="outlined" sx={{marginTop: '2vh', padding: '10px', marginLeft: '4vw', marginRight: '4vw', borderRadius: '10px', width: '40%'}}>
            <div style={{textAlign: 'left'}}>
                <div>mod_score      : {data.moderator_matching.moderator_score}</div>
                <div>productivity   : {data.moderator_matching.productivity}</div>
                <div>accuracy       :{data.moderator_matching.accuracy}</div>
            </div>
        </Card>
        </div>
    )
};

const Task = ({data}) => {
    const moderator = data.moderator_matching
    return (
        <Card className="score-card" variant="outlined" sx={{marginTop: '2vh', padding: '10px', marginLeft: '4vw', marginRight: '1vw', borderRadius: '10px', width: '40%'}}>
            <div style={{fontSize: '1.4rem'}}>{moderator.remaining_tasks}</div>
            <div>Remaining tasks to be assigned today</div>
        </Card>
    )
};

const Utilization = ({data}) => {
    const moderator = data.moderator_matching
    return (
        <Card className="score-card" variant="outlined" sx={{marginTop: '2vh', padding: '10px', marginLeft: '1vw', marginRight: '4vw', borderRadius: '10px', width: '40%'}}>
            <div style={{fontSize: '1.4rem'}}>{moderator.utilization}</div>
            <div>% increase in Utilization</div>
        </Card>
    )
};


const Result = ({data}) => {
    useEffect(() => {
        console.log("data video violation: " )
        console.log("this is the output" + data.video_violation.Violence);
    }, [data]);

    return (
        <>
            <AdScoringSystem data={data}/>
            <AdScoringValue data={data}/>
            <div style={{display:'flex', justifyContent:'center'}}>
                <ViolationType data={data}/>
                <AdCategory data={data}/>
            </div>
            <ModeratorMatching data={data}/>
            <ModScore data={data}/>
            <div style={{display:'flex', justifyContent:'center'}}>
                <Task data={data}/>
                <Utilization data={data}/>
            </div>
        </>
    );
}

export default Result;