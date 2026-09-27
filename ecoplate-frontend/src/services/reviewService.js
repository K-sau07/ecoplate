import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_URL = `${API_BASE_URL}/reviews`;

const getAuthHeader = () => {
	const token = localStorage.getItem("token");
	return { Authorization: `Bearer ${token}` };
};

export const reviewService = {
	// Get reviews for a food item
	getReviewsForItem: async (foodItemId) => {
		try {
			const response = await axios.get(
				`${API_URL}/food-item/${foodItemId}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching reviews:", error);
			throw error;
		}
	},

	// Create a review
	createReview: async (reviewData) => {
		try {
			// Map 'comment' to 'reviewText' for backend
			const backendData = {
				foodItemId: reviewData.foodItemId,
				rating: reviewData.rating,
				reviewText: reviewData.comment,
			};
			const response = await axios.post(
				API_URL,
				backendData,
				{
					headers: getAuthHeader(),
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error creating review:", error);
			throw error;
		}
	},

	// Update a review
	updateReview: async (reviewId, reviewData) => {
		try {
			// reuse the backend DTO structure (foodItemId is ignored by backend on update but required by DTO validation)
			const backendData = {
				foodItemId: reviewData.foodItemId,
				rating: reviewData.rating,
				reviewText: reviewData.comment,
			};
			const response = await axios.put(
				`${API_URL}/${reviewId}`,
				backendData,
				{
					headers: getAuthHeader(),
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error updating review:", error);
			throw error;
		}
	},

	// Delete a review
	deleteReview: async (reviewId) => {
		try {
			await axios.delete(`${API_URL}/${reviewId}`, {
				headers: getAuthHeader(),
			});
		} catch (error) {
			console.error("Error deleting review:", error);
			throw error;
		}
	},

	// Like/unlike a review
	toggleLike: async (reviewId) => {
		try {
			const response = await axios.post(
				`${API_URL}/${reviewId}/like`,
				{},
				{
					headers: getAuthHeader(),
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error toggling like:", error);
			throw error;
		}
	},
};
