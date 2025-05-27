import { useState } from 'react';

const CreditScoreGuide = () => {
    const [showGuide, setShowGuide] = useState(false);

    return (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="mr-2">📊</span>
                        How Credit Scoring Works
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Learn how your payment behavior affects your credit score
                    </p>
                </div>
                <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    {showGuide ? 'Hide Guide' : 'View Guide'}
                </button>
            </div>

            {showGuide && (
                <div className="mt-6 space-y-6">
                    {/* Credit Score Ranges */}
                    <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="mr-2">🎯</span>
                            Credit Score Ranges
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="text-center p-3 bg-red-50 rounded border-l-4 border-red-500">
                                <div className="text-red-600 font-bold text-lg">300-549</div>
                                <div className="text-red-800 font-medium">Poor</div>
                                <div className="text-xs text-red-600 mt-1">High Risk</div>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                                <div className="text-yellow-600 font-bold text-lg">550-649</div>
                                <div className="text-yellow-800 font-medium">Fair</div>
                                <div className="text-xs text-yellow-600 mt-1">Moderate Risk</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                <div className="text-blue-600 font-bold text-lg">650-749</div>
                                <div className="text-blue-800 font-medium">Good</div>
                                <div className="text-xs text-blue-600 mt-1">Low Risk</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded border-l-4 border-green-500">
                                <div className="text-green-600 font-bold text-lg">750-850</div>
                                <div className="text-green-800 font-medium">Excellent</div>
                                <div className="text-xs text-green-600 mt-1">Very Low Risk</div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Impact */}
                    <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="mr-2">⚡</span>
                            Payment Impact on Credit Score
                        </h4>
                        
                        <div className="space-y-4">
                            {/* Early Payments */}
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h5 className="font-semibold text-blue-700 flex items-center">
                                    <span className="mr-2">🚀</span>
                                    Early Payments (Positive Impact)
                                </h5>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                        <span>Very Early (25%+ of loan duration remaining)</span>
                                        <span className="font-bold text-blue-600">+100 points</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                        <span>Early (50%+ of loan duration remaining)</span>
                                        <span className="font-bold text-blue-600">+75 points</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                        <span>Moderately Early</span>
                                        <span className="font-bold text-blue-600">+50 points</span>
                                    </div>
                                </div>
                            </div>

                            {/* On-Time Payments */}
                            <div className="border-l-4 border-green-500 pl-4">
                                <h5 className="font-semibold text-green-700 flex items-center">
                                    <span className="mr-2">✅</span>
                                    On-Time Payments (Positive Impact)
                                </h5>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                        <span>Well ahead of deadline (75%+ duration remaining)</span>
                                        <span className="font-bold text-green-600">+50 points</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                        <span>With time to spare (6+ days early)</span>
                                        <span className="font-bold text-green-600">+35 points</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                        <span>Before deadline (1-5 days early)</span>
                                        <span className="font-bold text-green-600">+15 points</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                        <span>On deadline day</span>
                                        <span className="font-bold text-gray-600">0 points</span>
                                    </div>
                                </div>
                            </div>

                            {/* Late Payments */}
                            <div className="border-l-4 border-red-500 pl-4">
                                <h5 className="font-semibold text-red-700 flex items-center">
                                    <span className="mr-2">⚠️</span>
                                    Late Payments (Negative Impact)
                                </h5>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                        <span>1 day late</span>
                                        <span className="font-bold text-red-600">-5 points</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                        <span>2-5 days late</span>
                                        <span className="font-bold text-red-600">-30 points</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                        <span>6+ days late</span>
                                        <span className="font-bold text-red-600">-50 points</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tips for Better Credit */}
                    <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="mr-2">💡</span>
                            Tips for Building Better Credit
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <div>
                                        <div className="font-medium">Pay Early When Possible</div>
                                        <div className="text-sm text-gray-600">Early payments give the biggest credit score boost</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <div>
                                        <div className="font-medium">Set Payment Reminders</div>
                                        <div className="text-sm text-gray-600">Never miss a deadline to avoid penalties</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <div>
                                        <div className="font-medium">Build Payment History</div>
                                        <div className="text-sm text-gray-600">Consistent repayments improve your score over time</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="text-red-500 mr-2 mt-1">✗</span>
                                    <div>
                                        <div className="font-medium">Avoid Late Payments</div>
                                        <div className="text-sm text-gray-600">Even 1 day late affects your score</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-red-500 mr-2 mt-1">✗</span>
                                    <div>
                                        <div className="font-medium">Don't Ignore Deadlines</div>
                                        <div className="text-sm text-gray-600">Late payments compound over time</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-blue-500 mr-2 mt-1">ℹ</span>
                                    <div>
                                        <div className="font-medium">Monitor Your Score</div>
                                        <div className="text-sm text-gray-600">Check regularly to track your progress</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Starting Score Info */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="mr-2">📈</span>
                            New User Information
                        </h4>
                        <p className="text-sm text-gray-600">
                            New users start with a credit score of <strong>600</strong>. Your score will change based on your payment behavior. 
                            The system tracks your total loans, on-time payments, early payments, and late payments to calculate your overall creditworthiness.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditScoreGuide;