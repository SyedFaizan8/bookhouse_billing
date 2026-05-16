const http = require("http");

const PORT = 3000;

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Locked</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f6f9;
            color: #333333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 20px;
        }
        .card {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 450px;
            width: 100%;
            padding: 35px;
            text-align: center;
            border-top: 5px solid #dc3545;
        }
        .icon {
            font-size: 50px;
            margin-bottom: 15px;
        }
        h1 {
            font-size: 22px;
            margin-bottom: 15px;
            color: #222222;
        }
        p {
            font-size: 15px;
            line-height: 1.5;
            color: #555555;
            margin-bottom: 25px;
        }
        .btn {
            display: inline-block;
            background-color: #dc3545;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 4px;
            font-weight: bold;
        }
        .btn:hover {
            background-color: #c82333;
        }
    </style>
</head>
<body>

    <div class="card">
        <div class="icon">⚠️</div>
        <h1>Website Locked</h1>

        <p>
            This website is temporarily turned off.
            <br><br>
            To unlock this website and continue using it, please pay the remaining balance.
        </p>

        <a href="#" class="btn">Pay Remaining Balance</a>
    </div>

</body>
</html>
`;

const server = http.createServer((req, res) => {
  // This catches ALL routes (like /, /about, /dashboard) and shows the lock page
  res.writeHead(402, { "Content-Type": "text/html" });
  res.end(htmlContent);
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

