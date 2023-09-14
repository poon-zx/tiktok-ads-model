import React, { useState, useEffect, useRef } from 'react';
import {useNavigate} from 'react-router-dom';
import { Card, TextField, Button, InputLabel, MenuItem, OutlinedInput, Select, FormControl } from '@mui/material';
import './form.css';
import Tiktok from '../tiktok.png'

const AdForm = ({setParentState}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        adTitle: '',
        advertiserName: '',
        description: '',
        deliveryMarket: [],
        productLine: [],
        taskType: [],
        startDate:'',
    });
    const [productLine, setProductLine] = useState([]);
    const [deliveryMarket, setDeliveryMarket] = useState([]);
    const [taskType, setTaskType] = useState([]);
    const fileUploadInput = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const productLineArray = ['Non-Auction Ads', 'Auction Ads', 'RIE', 'Shopping Ads'];
    const deliveryMarketArray = ['AE', 'AR', 'AT', 'AU', 'BE', 'BH', 'BR', 'BY', 'CA','CH', 'CL', 'CO', 'CZ', 'DE', 'DK', 'EC', 'EG', 'ES', 'FI', 'FR', 'GB', 'GR', 'HU', 'ID', 'IE', 'IL', 'IQ', 'IT', 'JO', 'JP', 'KH', 'KR', 'KW', 'KZ', 'LB', 'MA', 'MX', 'MY', 'NL', 'NO', 'NZ', 'OM', 'PE', 'PH', 'PK', 'PL', 'PT', 'QA', 'RO', 'SA', 'SE', 'SG', 'TH', 'TR', 'TW', 'US', 'UY', 'VN', 'ZA'];
    const taskTypeArray = ['auction_relation', 'Ad Group Recall (Merged)', 'auction_all',
    'Promote', 'Promote Report Recall', 'R&F', 'Branding Ads',
    'Shopping Ad Group', 'Auction Ad Group'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
    };

    const handleArrayProductLine = (event) => {
        const {
          target: { value },
        } = event;
        setProductLine(
          typeof value === 'string' ? value.split(',') : value,
        );
        setFormData({
            ...formData,
            productLine: value,
        });
      };
    
        const handleArrayDeliveryMarket= (event) => {
            const {
            target: { value },
            } = event;
            setDeliveryMarket(
            typeof value === 'string' ? value.split(',') : value,
            );
            setFormData({
                ...formData,
                deliveryMarket: value,
            });
        };

        const handleArrayTaskType= (event) => {
            const {
            target: { value },
            } = event;
            setTaskType(
            typeof value === 'string' ? value.split(',') : value,
            );
            setFormData({
                ...formData,
                taskType: value,
            });
        };

        const handleFileChange = (e) => {
            const file = e.target.files[0]; // Get the first selected file
            if (file && file.type === 'video/mp4') {
            // File is valid MP4
            setSelectedFile(file);
            } else {
            // Invalid file type
            alert('Please select a valid MP4 file.');
            e.target.value = null; // Clear the input
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            const DEFAULT_FILE_NAME = 'videoFile';
            (async () => {
              try {
                const dataToSend = new FormData();

                for (const key in formData) {
                    dataToSend.append(key, formData[key]);
                };

                const file = fileUploadInput.current.files[0];
                dataToSend.append(DEFAULT_FILE_NAME, file);
          
                // const response = await axios.post(FILE_UPLOAD_ENDPOINT, dataToSend, { headers });
          
                // console.log('Upload successful:', response.data);

                // setParentState(response.data);

                setParentState(dataToSend);
                navigate('/result');

                // navigate('/result', {formData: dataToSend});
                // const formDataJSON = JSON.stringify(Object.fromEntries(dataToSend.entries()));
                // navigate('/result', {state: {formData: formDataJSON}});
          
                // Now you can handle other form data submission if needed
              } catch (error) {
                console.error('Error uploading file:', error);
              }
            })();
        };          

    return (
        <div style={{margin: '0 0 40px'}}>
            <div className="form-border">
                <Card variant="outlined" className="ad-card" 
                    sx={{
                    marginTop: '50px',
                    borderRadius: '8px', 
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }} 
                    >
            <div className="tiktok-box">
                <img className="tiktok-logo" src={Tiktok} alt="tiktok-logo" style={{height: '80px', padding: '20px 0'}}/>
            </div>
            <form 
            onSubmit={handleSubmit}>
                <TextField
                label="Advertisement Title"
                name="adTitle"
                value={formData.adTitle}
                onChange={handleChange}
                fullWidth
                margin="normal"
                style={{ width: '90%' }}
                />

                <TextField
                label="Advertiser Name"
                name="advertiserName"
                value={formData.advertiserName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                style={{ width: '90%' }}
                />

                <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                margin="normal"
                style={{ width: '90%' }}
                />

                <TextField
                label="Start Date (DD/MM/YYYY)"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                fullWidth
                margin="normal"
                style={{ width: '90%' }}
                />

                <FormControl sx = {{width: '90%', marginTop: '15px'}}>
                    <InputLabel id="demo-multiple-name-label">Delivery Market</InputLabel>
                    <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        value={deliveryMarket}
                        onChange={handleArrayDeliveryMarket}
                        input={<OutlinedInput label="Delivery Market" />}
                        label="Delivery Market"
                        MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 270,
                                width: 250,
                              },
                            },
                        }}
             
                    >
                        {deliveryMarketArray.map((product) => (
                            <MenuItem
                            key={product}
                            value={product}
                            >
                            {product}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <FormControl sx = {{width: '90%', marginTop: '20px'}}>
                    <InputLabel id="demo-multiple-name-label">Product Line</InputLabel>
                    <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        value={productLine}
                        onChange={handleArrayProductLine}
                        input={<OutlinedInput label="Product Line" />}
                        label="Product Line"
                    >
                        {productLineArray.map((product) => (
                            <MenuItem
                            key={product}
                            value={product}
                            >
                            {product}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx = {{width: '90%', marginTop: '20px'}}>
                    <InputLabel id="demo-multiple-name-label">Task Type</InputLabel>
                    <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        value={taskType}
                        onChange={handleArrayTaskType}
                        input={<OutlinedInput label="Task Type" />}
                        label="Task Type"
                        MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 130,
                                width: 250,
                              },
                            },
                        }}
                    >
                        {taskTypeArray.map((product) => (
                            <MenuItem
                            key={product}
                            value={product}
                            >
                            {product}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <div className="center">
                    <input
                        ref={fileUploadInput}
                        type="file"
                        accept="video/mp4"
                        id="fileUploadInput"
                        onChange={handleFileChange}
                        style={{marginTop: '20px', marginBottom: '15px', fontSize: "16px", marginLeft:'9vw'}}
                    />
                </div>

                <div className="center">
                    <Button type="submit" variant="contained" color="primary" sx={{marginBottom:"10px"}}>
                        Submit
                    </Button>
                </div>
                
            </form>
            </Card>
            </div>
        </div>

    );
}

export default AdForm;

