<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

// Check if this is an API request
$isApiRequest = isset($_GET['api']) || isset($_POST['api']) || 
                (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false);

if ($isApiRequest) {
    header('Content-Type: application/json');
    
    // API Status endpoint
    $action = $_GET['action'] ?? $_POST['action'] ?? 'status';
    
    switch ($action) {
        case 'status':
            // Check database connection and return system status
            try {
                $result = $conn->query("SELECT COUNT(*) as total_users FROM users");
                $userCount = $result->fetch_assoc()['total_users'];
                
                $result = $conn->query("SELECT COUNT(*) as total_loans FROM loan_requests");
                $loanCount = $result->fetch_assoc()['total_loans'];
                
                $result = $conn->query("SELECT COUNT(*) as funded_loans FROM funded_loans");
                $fundedCount = $result->fetch_assoc()['funded_loans'];
                
                $result = $conn->query("SELECT COUNT(*) as repaid_loans FROM repaid_loans");
                $repaidCount = $result->fetch_assoc()['repaid_loans'];
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Cardano Loan Tracker API is operational',
                    'timestamp' => time(),
                    'stats' => [
                        'total_users' => (int)$userCount,
                        'total_loan_requests' => (int)$loanCount,
                        'funded_loans' => (int)$fundedCount,
                        'repaid_loans' => (int)$repaidCount,
                        'active_loans' => (int)$fundedCount - (int)$repaidCount
                    ]
                ]);
            } catch (Exception $e) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Database connection failed',
                    'error' => $e->getMessage()
                ]);
            }
            break;
            
        case 'endpoints':
            // Return available API endpoints
            echo json_encode([
                'status' => 'success',
                'endpoints' => [
                    'users.php' => [
                        'register' => 'POST - Register/login user with wallet address and PKH'
                    ],
                    'funded_loans.php' => [
                        'add' => 'POST - Add a new funded loan',
                        'get' => 'POST - Get funded loans for a lender',
                        'getBorrowerLoans' => 'POST - Get active loans for a borrower',
                        'getBorrowerRepaidLoans' => 'POST - Get repaid loans for a borrower',
                        'repay' => 'POST - Mark a loan as repaid',
                        'getCreditScore' => 'POST - Get credit score for a user',
                        'verify' => 'POST - Verify active loans against blockchain',
                        'getAllFundedLoanIds' => 'GET - Get all funded loan IDs',
                        'getOriginalLoanId' => 'POST - Get original loan ID from funded loan ID'
                    ]
                ]
            ]);
            break;
            
        default:
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid API action'
            ]);
    }
    exit;
}

// If not an API request, serve the HTML interface
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cardano Loan Tracker</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card h2 {
            color: #5a67d8;
            margin-bottom: 20px;
            font-size: 1.8rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #4299e1, #3182ce);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .endpoint-list {
            list-style: none;
        }
        
        .endpoint-list li {
            background: #f7fafc;
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #5a67d8;
        }
        
        .endpoint-list .method {
            background: #5a67d8;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-right: 10px;
        }
        
        .endpoint-list .url {
            font-weight: bold;
            color: #2d3748;
        }
        
        .endpoint-list .description {
            color: #718096;
            margin-top: 5px;
            font-size: 0.9rem;
        }
        
        .test-section {
            margin-top: 20px;
        }
        
        .test-button {
            background: #48bb78;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            margin-right: 10px;
        }
        
        .test-button:hover {
            background: #38a169;
        }
        
        .test-result {
            margin-top: 15px;
            padding: 15px;
            border-radius: 6px;
            background: #f7fafc;
            border: 1px solid #e2e8f0;
        }
        
        .code {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            margin-top: 10px;
        }
        
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .container {
                padding: 10px;
            }
            
            .card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cardano Loan Tracker</h1>
            <p>Decentralized Lending Platform API</p>
        </div>
        
        <div class="card">
            <h2>📊 System Statistics</h2>
            <div class="stats-grid" id="statsGrid">
                <div class="stat-card">
                    <div class="stat-number" id="totalUsers">-</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="totalLoans">-</div>
                    <div class="stat-label">Loan Requests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="fundedLoans">-</div>
                    <div class="stat-label">Funded Loans</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="repaidLoans">-</div>
                    <div class="stat-label">Repaid Loans</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="activeLoans">-</div>
                    <div class="stat-label">Active Loans</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>🔗 API Endpoints</h2>
            <ul class="endpoint-list">
                <li>
                    <span class="method">GET</span>
                    <span class="url">/?api=1&action=status</span>
                    <div class="description">Get system status and statistics</div>
                </li>
                <li>
                    <span class="method">POST</span>
                    <span class="url">/users.php?action=register</span>
                    <div class="description">Register or login a user with wallet address and payment key hash</div>
                </li>
                <li>
                    <span class="method">POST</span>
                    <span class="url">/funded_loans.php?action=add</span>
                    <div class="description">Add a new funded loan to the system</div>
                </li>
                <li>
                    <span class="method">POST</span>
                    <span class="url">/funded_loans.php?action=get</span>
                    <div class="description">Get funded loans for a specific lender</div>
                </li>
                <li>
                    <span class="method">POST</span>
                    <span class="url">/funded_loans.php?action=getBorrowerLoans</span>
                    <div class="description">Get active loans for a specific borrower</div>
                </li>
                <li>
                    <span class="method">POST</span>
                    <span class="url">/funded_loans.php?action=repay</span>
                    <div class="description">Mark a loan as repaid and update credit score</div>
                </li>
                <li>
                    <span class="method">POST</span>
                    <span class="url">/funded_loans.php?action=getCreditScore</span>
                    <div class="description">Get credit score information for a user</div>
                </li>
            </ul>
            
            <div class="test-section">
                <button class="test-button" onclick="testApiStatus()">Test API Status</button>
                <button class="test-button" onclick="testEndpoints()">Get All Endpoints</button>
                <div id="testResult" class="test-result" style="display: none;"></div>
            </div>
        </div>
        
        <div class="card">
            <h2>📚 Usage Examples</h2>
            <h3>Register a User</h3>
            <div class="code">
POST /users.php?action=register
Content-Type: application/json

{
    "address": "addr1qxy...",
    "pkh": "abc123..."
}
            </div>
            
            <h3>Add a Funded Loan</h3>
            <div class="code">
POST /funded_loans.php?action=add
Content-Type: application/json

{
    "loanId": "loan_123",
    "fundedLoanId": "funded_456",
    "lenderPKH": "lender_pkh",
    "borrowerPKH": "borrower_pkh",
    "loanAmount": 1000000,
    "interest": 10,
    "deadline": 1640995200000,
    "txHash": "tx_hash_here",
    "fundedWith": [{"txHash": "utxo_tx", "outputIndex": 0}],
    "fundedAt": 1640908800000
}
            </div>
            
            <h3>Get Credit Score</h3>
            <div class="code">
POST /funded_loans.php?action=getCreditScore
Content-Type: application/json

{
    "userPKH": "user_payment_key_hash"
}
            </div>
        </div>
        
        <div class="card">
            <h2>🎯 Features</h2>
            <ul style="list-style-type: disc; margin-left: 20px; line-height: 1.8;">
                <li><strong>User Management:</strong> Register and manage users with Cardano wallet addresses</li>
                <li><strong>Loan Tracking:</strong> Track loan requests from creation to repayment</li>
                <li><strong>Credit Scoring:</strong> Dynamic credit scoring based on payment history and timing</li>
                <li><strong>Payment Analysis:</strong> Detailed tracking of early, on-time, and late payments</li>
                <li><strong>UTXO Management:</strong> Track funding UTXOs for each loan</li>
                <li><strong>Verification:</strong> Verify active loans against blockchain state</li>
            </ul>
        </div>
    </div>
    
    <script>
        // Load stats on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
        });
        
        async function loadStats() {
            try {
                const response = await fetch('/?api=1&action=status');
                const data = await response.json();
                
                if (data.status === 'success' && data.stats) {
                    document.getElementById('totalUsers').textContent = data.stats.total_users;
                    document.getElementById('totalLoans').textContent = data.stats.total_loan_requests;
                    document.getElementById('fundedLoans').textContent = data.stats.funded_loans;
                    document.getElementById('repaidLoans').textContent = data.stats.repaid_loans;
                    document.getElementById('activeLoans').textContent = data.stats.active_loans;
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }
        
        async function testApiStatus() {
            const resultDiv = document.getElementById('testResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p>Loading...</p>';
            resultDiv.className = 'test-result loading';
            
            try {
                const response = await fetch('/?api=1&action=status');
                const data = await response.json();
                
                resultDiv.innerHTML = `
                    <h4>API Status Response:</h4>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
                `;
                resultDiv.className = 'test-result';
            } catch (error) {
                resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                resultDiv.className = 'test-result';
            }
        }
        
        async function testEndpoints() {
            const resultDiv = document.getElementById('testResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p>Loading...</p>';
            resultDiv.className = 'test-result loading';
            
            try {
                const response = await fetch('/?api=1&action=endpoints');
                const data = await response.json();
                
                resultDiv.innerHTML = `
                    <h4>Available Endpoints:</h4>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
                `;
                resultDiv.className = 'test-result';
            } catch (error) {
                resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                resultDiv.className = 'test-result';
            }
        }
    </script>
</body>
</html>