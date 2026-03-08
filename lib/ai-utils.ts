/**
 * Strategic AI Utilities for the CEO Hub
 * Provides template-based smart replies and tactical insights.
 */

export type Sentiment = 'Positive' | 'Neutral' | 'Concerned';

export const generateSmartReply = (subject: string, message: string, sentiment: Sentiment): string => {
  const templates = {
    Positive: [
      `Dear Parent, thank you so much for your kind words regarding "${subject}". We truly appreciate your support and are thrilled to hear about your positive experience. We will share this feedback with the relevant team. Best regards, School CEO Office.`,
      `Hello, we are delighted to receive your feedback on "${subject}". It's wonderful to know we're meeting your expectations. Your encouragement motivates us to keep striving for excellence. Warm regards, School CEO Office.`
    ],
    Neutral: [
      `Dear Parent, thank you for contacting us regarding "${subject}". We have received your message and our team is looking into it. We will get back to you with more information shortly. Best regards, School CEO Office.`,
      `Hello, thank you for your inquiry about "${subject}". We've logged this in our system and will provide an update as soon as possible. Kind regards, School CEO Office.`
    ],
    Concerned: [
      `Dear Parent, thank you for bringing your concerns regarding "${subject}" to our attention. We take this very seriously and are prioritizing a resolution. A member of our leadership team will contact you within 24 hours to discuss this further. Sincerely, School CEO Office.`,
      `Hello, we sincerely apologize for the issues you've experienced with "${subject}". We are investigating this immediately to ensure it is resolved to your satisfaction. Thank you for your patience. Regards, School CEO Office.`
    ]
  };

  const selectedTemplates = templates[sentiment] || templates.Neutral;
  return selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
};

export const getTacticalInsights = (data: {
  attendanceRiskCount: number;
  enrollmentGrowth: number;
  pendingQueries: number;
  sentimentTrend: string;
}) => {
  const insights = [];

  if (data.attendanceRiskCount > 5) {
    insights.push({
      type: 'Risk',
      message: `${data.attendanceRiskCount} students identified as high-priority attendance risks. Intervention required.`,
      priority: 'High'
    });
  }

  if (data.enrollmentGrowth > 10) {
    insights.push({
      type: 'Growth',
      message: `Enrollment velocity is outperforming targets by ${data.enrollmentGrowth}%. Capacity planning recommended.`,
      priority: 'Medium'
    });
  }

  if (data.pendingQueries > 20) {
    insights.push({
      type: 'Operational',
      message: `Parent query backlog growing. Consider reallocating staff to support channels.`,
      priority: 'Medium'
    });
  }

  if (data.sentimentTrend === 'Declining') {
    insights.push({
      type: 'Risk',
      message: `Negative sentiment trend detected in Grade 9 parent group. Recommend targeted communication.`,
      priority: 'High'
    });
  }

  return insights;
};
