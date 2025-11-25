import React, { useState, useEffect } from 'react';

interface Review {
  _id: string;
  userId?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  listingId: string;
  listingUrl: string;
  transactionDate: string;
  transactionType: string;
  ratings?: {
    trustLevel: number;
    valueForMoney: number;
    locationAccuracy: number;
    disclosedHiddenFees: number;
    averageRating: number;
  };
  detailedFeedback: string;
  tags?: string[];
  status: 'approved' | 'rejected' | 'pending';
  helpfulCount?: number;
  moderatedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  moderationNote?: string;
  createdAt: string;
}

interface ReviewsTabProps {
  listingId?: string;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ listingId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    
    try {
      const token = localStorage.getItem("admin_token");
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/reviews?page=${currentPage}&limit=50&status=all&sortBy=recent`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === "OK" && data.data) {
        setReviews(data.data.reviews || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalResults(data.data.pagination?.totalResults || 0);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewsError(
        error instanceof Error ? error.message : "Failed to load reviews"
      );
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // APPROVE / REJECT PATCH API
  const handleReviewAction = async (
    reviewId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/reviews/${reviewId}/moderate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: action === "approve" ? "approved" : "rejected",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} review.`);
      }

      fetchReviews();
      alert(`Review ${action}d successfully.`);
    } catch (error) {
      console.error(error);
      alert(`Failed to ${action} review. Please try again.`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-[#90EE90]";
    if (rating >= 3.5) return "bg-[#FFE87C]";
    if (rating >= 2.5) return "bg-[#FFD580]";
    return "bg-[#FFB6C1]";
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return `${"⭐".repeat(fullStars)} (${rating.toFixed(1)})`;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="🔍 Search reviews"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border-0 bg-[#5DABA4] text-white placeholder-white px-4 py-2.5 text-sm"
        />
      </div>

      {/* Loading State */}
      {reviewsLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#4EA8A1] border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      )}

      {/* Error */}
      {reviewsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">
            <strong>Error:</strong> {reviewsError}
          </p>
          <button
            onClick={fetchReviews}
            className="mt-2 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* TABLE */}
      {!reviewsLoading && !reviewsError && (
        <>
          <div className="overflow-x-auto rounded-md border border-gray-300 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#5DABA4]">
                <tr>
                  {[
                    "Reviewer",
                    "Transaction Type",
                    "Rating",
                    "Date",
                    "Review",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left font-semibold text-white"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {review.userId?.firstName} {review.userId?.lastName}
                        <br />
                        <span className="text-xs text-gray-500">
                          {review.userId?.email}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            review.transactionType === "Bought"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {review.transactionType}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold text-gray-800 ${getRatingColor(
                            review.ratings?.averageRating || 0
                          )}`}
                        >
                          {getRatingStars(review.ratings?.averageRating || 0)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-md px-2 py-1 text-xs bg-gray-100 border border-gray-300">
                          {formatDate(review.createdAt)}
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="truncate">{review.detailedFeedback}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            review.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : review.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {review.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setIsModalOpen(true);
                            }}
                            className="text-[#5DABA4] font-semibold hover:underline"
                          >
                            View
                          </button>

                          <span className="text-gray-300">|</span>

                          <button
                            onClick={() =>
                              handleReviewAction(review._id, "approve")
                            }
                            disabled={review.status === "approved"}
                            className="text-[#5DABA4] font-semibold hover:underline disabled:opacity-50"
                          >
                            Approve
                          </button>

                          <span className="text-gray-300">|</span>

                          <button
                            onClick={() =>
                              handleReviewAction(review._id, "reject")
                            }
                            disabled={review.status === "rejected"}
                            className="text-red-500 font-semibold hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 relative">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-3">Review Details</h2>

            <p className="text-sm mb-2">
              <strong>Reviewer:</strong> {selectedReview.userId?.firstName}{" "}
              {selectedReview.userId?.lastName} ({selectedReview.userId?.email})
            </p>

            <p className="text-sm mb-2">
              <strong>Transaction Type:</strong> {selectedReview.transactionType}
            </p>

            <p className="text-sm mb-2">
              <strong>Transaction Date:</strong> {formatDate(selectedReview.transactionDate)}
            </p>

            {selectedReview.ratings && (
              <div className="mb-3">
                <strong className="text-sm">Ratings</strong>
                <ul className="ml-4 text-sm">
                  <li>Trust Level: {selectedReview.ratings.trustLevel}</li>
                  <li>Value for Money: {selectedReview.ratings.valueForMoney}</li>
                  <li>Location Accuracy: {selectedReview.ratings.locationAccuracy}</li>
                  <li>Hidden Fees: {selectedReview.ratings.disclosedHiddenFees}</li>
                  <li>Average Rating: {selectedReview.ratings.averageRating}</li>
                </ul>
              </div>
            )}

            <p className="text-sm mb-2">
              <strong>Feedback:</strong> {selectedReview.detailedFeedback}
            </p>

            {selectedReview.tags && (
              <div className="flex gap-2 flex-wrap mb-2">
                {selectedReview.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm mb-2">
              <strong>Status:</strong>{" "}
              <span className="capitalize">{selectedReview.status}</span>
            </p>

            {selectedReview.moderatedBy && (
              <p className="text-sm mb-2">
                <strong>Moderated By:</strong>{" "}
                {selectedReview.moderatedBy.firstName}{" "}
                {selectedReview.moderatedBy.lastName}
              </p>
            )}

            <p className="text-sm mb-4">
              <strong>Moderation Note:</strong> {selectedReview.moderationNote}
            </p>

            <a
              href={selectedReview.listingUrl}
              target="_blank"
              className="text-[#5DABA4] underline text-sm"
            >
              Open listing
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
