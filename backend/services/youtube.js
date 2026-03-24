export const fetchVideos = async (query) => {
    if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY.trim() === '') {
        console.warn("WARN: YOUTUBE_API_KEY is not set. Returning a mock video.");
        return [
            { title: "Mock Video - Important Concepts", videoId: "dQw4w9WgXcQ", thumbnail: "" }
        ];
    }
    
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${process.env.YOUTUBE_API_KEY}&maxResults=3`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (!res.ok) {
            console.error("YouTube API Error Details:", data.error?.message);
            throw new Error(data.error?.message || 'Failed to fetch videos from YouTube');
        }

        if (!data.items) return [];

        return data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            thumbnail: item.snippet.thumbnails?.medium?.url || ''
        }));
    } catch (err) {
        console.error("YouTube API Request Failed:", err.message);
        throw err;
    }
};
