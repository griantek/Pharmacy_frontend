'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Star, Send } from 'lucide-react';
import { API_URLS } from "@/utils/constants";
import axios from 'axios';

interface FeedbackProps {
  orderId: string;
  deliveryBoyId: string;
}

const FeedbackPage = ({ orderId, deliveryBoyId }: FeedbackProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = async () => {
    if (!rating) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(`${API_URLS.BACKEND_URL}/api/feedback`, {
        orderId,
        deliveryBoyId,
        rating,
        comment
      });
      setIsSubmitted(true);
    } catch (error) {
      setError('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto m-4">
        <CardBody className="p-6 text-center">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Thank You!</h2>
          <p className="text-default-500">
            Thank you for your feedback about our delivery service.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto m-4">
      <CardBody className="p-6">
        <h2 className="text-xl font-bold text-center mb-6">
          Rate Your Delivery Experience
        </h2>

        <div className="space-y-6">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="light"
                isIconOnly
                onPress={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    rating && star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </Button>
            ))}
          </div>

          <Textarea
            placeholder="How was your medicine delivery experience?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            minRows={3}
          />

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <Button
            color="primary"
            onPress={submitFeedback}
            isDisabled={!rating || isSubmitting}
            className="w-full"
            startContent={<Send className="w-4 h-4" />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default FeedbackPage;