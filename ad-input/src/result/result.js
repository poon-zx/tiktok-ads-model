import react, {useEffect, useRef, useState} from 'react';
import { Card } from '@mui/material';
import "./result.css"
import score from "../score.png"
import score2 from "../score_v2.png"
import needle from "../needle-pointer.png"
import axios from 'axios';

const roundTo2dp = (string) => {
    return (parseFloat(string) * 100).toFixed(2)
}

function ProgressBar(props) {
    const {width, color} = props
    const progressBarRef = useRef(null)
    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.width = width
            // entry.target.style.backgroundColor = color
            observer.unobserve(entry.target)
          }
        })
      }, {
        threshold: 0.1
      })
  
      observer.observe(progressBarRef.current)
  
      return () => {
        observer.disconnect()
      }
    }, [width, color])
  
    return (
      <div className="progress">
        <div ref={progressBarRef} className="progress-bar"></div>
      </div>
    )
}

const AdScoringSystem = ({data}) => {
    return (
        <>
            <h1>Ad Scoring System</h1>
            <Card className="score-card" variant="outlined" 
                sx={{
                    padding: '30px', 
                    marginLeft: '15vw', 
                    marginRight: '15vw',
                    borderRadius: '10px',
                    }}>
                <div style={{fontSize: '1.3rem', fontWeight: '500'}}>ad_score = β<sub>1</sub> ​× avg_ad_revenue + β<sub>2​</sub> × baseline_st - β<sub>3</sub> ​× days_diff +  β<sub>4</sub> x advertiser_tier</div>
                <div style={{margin: '20px 0 0', fontSize: '1.3rem', fontWeight: '600'}}>Confidence : {data.ad_score_equation.confidence}</div>
            </Card>
        </>
    )
}

const AdScoringValue = ({data}) => {
    const needleRef = useRef(null)
    const deg = data.ad_score_equation.score * 180 - 90
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.transform = `translate(-139.5px, 3.3px) rotate(${deg}deg)`
              // entry.target.style.backgroundColor = color
              observer.unobserve(entry.target)
            }
          })
        }, {
          threshold: 0.1
        })
    
        observer.observe(needleRef.current)
    
        return () => {
          observer.disconnect()
        }
      }, [deg])
    return (
        <div style={{display:'flex', justifyContent:'space-between', margin: '0 15vw'}}>
        <Card className="score-card" variant="outlined"
            sx={{
                width: '45%',
                marginTop: '20px', 
                padding: '20px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
                }}>
            <div style={{textAlign: 'center'}}>
                <div style={{
                }}>
                    <img src={score2} alt="score" style={{height: '80px'}}/>
                    <img ref={needleRef} src={needle} alt="needle" className='needle'/>
                </div>
                <div style={{fontSize: '1.3rem', fontWeight: '600'}}>ad_score : {data.ad_score_equation.score}</div>
            </div>
        </Card>
        <Card className="score-card" variant="outlined" 
            sx={{
                width: '45%',
                marginTop: '20px', 
                padding: '20px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'center', 
                alignItems: 'center'
                }}>
            <div style={{textAlign: 'left', fontWeight: '500'}}>
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
    const violations = data.violation_labels
    return (
        <>
            <div style={{textAlign: 'center', width: '45%'}}>
                <h2>Violation Type</h2>
                <Card className="score-card" variant="outlined" 
                sx={{
                    padding: '20px', 
                    borderRadius: '10px'
                    }}>
                    {Object.keys(violations).length !== 0 ? Object.keys(violations).map((key) => (
                        <div key={key}>
                            <div >{key} : {roundTo2dp(violations[key])}%</div>
                            <ProgressBar width={`${violations[key] * 100}%`} color={"#6f8ecd"}></ProgressBar>
                        </div>
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
            <div style={{ textAlign: 'center', width: '45%'}}>
                <h2>Ad Category</h2>
                <Card className="score-card" variant="outlined" 
                sx={{
                    padding: '20px',
                    borderRadius: '10px'
                }}
                >
                    {Object.keys(categories).length !== 0 ? Object.keys(categories).map((key) => (
                        <div key={key}>
                        <div >{key} : {roundTo2dp(categories[key])}%</div>
                        <ProgressBar width={`${categories[key] * 100}%`} color={"#6f8ecd"}></ProgressBar>
                        </div>
                    )) : <div>No Ad Categories</div>}
                </Card>
            </div>
        </>
    )
};

const ModeratorMatching = ({data}) => {
    const moderator = data.moderator_matching
    return (
        <>
            <Card className="score-card" variant="outlined" 
                sx={{
                    padding: '20px', 
                    margin: '30px 15vw', 
                    borderRadius: '10px'
                    }}>
                <p style={{fontSize: '1.3rem'}}>Ad will be reviewed by moderator <b>{moderator.moderator_id}</b></p>
                <div style={{margin: '10px 0'}}>Market: {moderator.market}</div>
                <div>Expertise: {moderator.expertise}</div>
            </Card>
        </>
    )
};

const ModScoringSystem = () => {
    return (
        <>
        <h1>Moderator Matching</h1>
        <Card className='score-card' variant='outlined'
            sx={{
                marginLeft: '15vw', 
                marginRight: '15vw',
                borderRadius: '10px',
                }}>
            <p style={{fontSize: '1.3rem', fontWeight: '500'}}>mod_score = β<sub>1</sub> x productivity + β<sub>2</sub> x accuracy</p>
        </Card>
        </>
    )
}

const ModScore = ({data}) => {
    const moderator = data.moderator_matching
    let {moderator_score, productivity, accuracy} = moderator
    moderator_score = roundTo2dp(moderator_score)
    productivity = roundTo2dp(productivity)
    accuracy = roundTo2dp(accuracy)
    return (
        <div style={{display:'flex', justifyContent:'center'}}>
        <Card className="score-card" variant="outlined" 
            sx={{
                width: '20%',
                marginTop: '20px', 
                padding: '20px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'center', 
                }}>
            <div style={{textAlign: 'left', width: '90%'}}>
                <div>mod_score      : {moderator_score}%</div>
                <ProgressBar width={`${moderator_score}%`} color={"#6f8ecd"}></ProgressBar>
                <div>productivity   : {productivity}%</div>
                <ProgressBar width={`${productivity}%`} color={"#6f8ecd"}></ProgressBar>
                <div>accuracy       : {accuracy}%</div>
                <ProgressBar width={`${accuracy}%`} color={"#6f8ecd"}></ProgressBar>
            </div>
        </Card>
        </div>
    )
};

const Task = ({data}) => {
    const moderator = data.moderator_matching
    return (
        <Card className="score-card" variant="outlined"
        sx={{width: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}
        >
            <div style={{fontSize: '3rem'}}><b>{moderator.remaining_tasks}</b></div>
            <div>Remaining tasks to be assigned today</div>
        </Card>
    )
};

const Utilization = ({data}) => {
    const moderator = data.moderator_matching
    const utilization = parseFloat(moderator.utilization).toFixed(2)
    return (
        <Card className="score-card" variant="outlined"
        sx={{width: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}
        >
            <div style={{fontSize: '3rem'}}><b>{utilization}%</b></div>
            <div>increase in Utilization</div>
        </Card>
    )
};

const ShowResult = ({data}) => {
    return (
        <div style={{margin: '20px 50px 80px'}}>
            <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                <AdScoringSystem data={data}/>
                <AdScoringValue data={data}/>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', margin: '0 15vw'}}>
                <ViolationType data={data}/>
                <AdCategory data={data}/>
            </div>
            <ModScoringSystem></ModScoringSystem>
            <ModScore data={data}/>
            <ModeratorMatching data={data}/>
            <div style={{display:'flex', justifyContent:'space-between', margin: '0 15vw', height: '150px'}}>
                <Task data={data}/>
                <Utilization data={data}/>
            </div>
        </div>
    );
}

function Loading() {
    return (
      <>
      <div className="loading-box">
        <div className="spin-wrapper">
          <div className="spinner">
          </div>
        </div>
        <p className='loading'>Loading...</p>  
      </div>
      </>
    )
  }

const Result = ({formData}) => {
    const [data, setData] = useState(null)
    useEffect(() => {
        const FILE_UPLOAD_ENDPOINT = 'http://127.0.0.1:5000/upload';
        const headers = {
            'Content-Type': 'multipart/form-data',
        };
        const callAPI = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
                const response = await axios.post(FILE_UPLOAD_ENDPOINT, formData, { headers });
                console.log(`Data: ${response.data}`)
                setData(response.data);
            } catch (error) {
                console.error(error);
            }
        }
        console.log('Uploading file...');
        callAPI();
        console.log('Upload complete!')
    }, [formData]);
    return (
        <>
            {data ? <ShowResult data={data}></ShowResult> : <Loading></Loading>}
        </>
    )
}

export default Result;