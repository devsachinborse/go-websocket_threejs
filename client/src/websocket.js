// const ws = new WebSocket('ws://localhost:1001/ws');

// ws.onopen = () => {
//     console.log('Connected to WebSocket server');
// };

// ws.onmessage = (event) => {
//     console.log('Received data:', event.data);

//     // Parse the message and update the scene accordingly
//     const data = JSON.parse(event.data);
//     if (data.type === 'update_position') {
//         // Update 3D object based on server message
//         cube.position.x = data.position.x;
//         cube.position.y = data.position.y;
//         cube.position.z = data.position.z;
//     }
// };

// ws.onclose = () => {
//     console.log('WebSocket connection closed');
// };

// export { ws };
