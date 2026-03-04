import { supabase } from "../supabaseClient";

class DatabaseService {
  // ==========================================
  // User & Auth
  // ==========================================
  async getUserById(id) {
    return supabase.from("user").select("*").eq("id", id).single();
  }

  async getUserBySeq(seq) {
    return supabase.from("user").select("*").eq("seq", seq).single();
  }

  getUsersQuery() {
    return supabase.from("user").select("seq, id, name, profile_url, cre_date, admin_yn", { count: "exact" }).eq("del_yn", "N");
  }

  async getUserCount() {
    return supabase.from("user").select("seq", { count: "exact", head: true }).eq("del_yn", "N");
  }

  async getAllUsers() {
    return supabase.from("user").select("*").order("cre_date", { ascending: false });
  }

  async insertUser(userData) {
    return supabase.from("user").insert([userData]);
  }

  async updateUser(seq, updateData) {
    return supabase.from("user").update(updateData).eq("seq", seq);
  }

  // ==========================================
  // Category
  // ==========================================
  async getCategories() {
    return supabase.from("category").select("*").eq("del_yn", "N").order("order", { ascending: true, nullsFirst: false }).order("seq", { ascending: true });
  }

  async getPublicCategories() {
    return supabase.from("category").select("*").eq("del_yn", "N").eq("show_yn", "Y").order("order", { ascending: true, nullsFirst: false }).order("seq", { ascending: true });
  }

  async getCategory(seq) {
    return supabase.from("category").select("*").eq("seq", seq).single();
  }

  async getAllCategoriesIncludeDeleted() {
    return supabase.from("category").select("*").order("order", { ascending: true, nullsFirst: false }).order("seq", { ascending: true });
  }

  async getCategoryByName(name) {
    return supabase.from("category").select("*").eq("name", name).eq("del_yn", "N");
  }

  async getCategoryByOrder(order) {
    return supabase.from("category").select("*").eq("order", order).eq("del_yn", "N");
  }

  async getCategoriesForWrite(isAdmin) {
    let query = supabase.from("category").select("*").order("seq", { ascending: true });
    if (!isAdmin) {
      query = query.eq("seq", 1);
    }
    return query;
  }

  async getMaxCategoryOrder() {
    return supabase.from("category").select("order").eq("del_yn", "N").order("order", { ascending: false }).limit(1).single();
  }

  async insertCategory(categoryData) {
    return supabase.from("category").insert([categoryData]);
  }

  async updateCategory(seq, updateData) {
    return supabase.from("category").update(updateData).eq("seq", seq);
  }

  // ==========================================
  // Board (Posts)
  // ==========================================
  async getPostBySeq(seq) {
    return supabase.from("board").select(`*, user:user_seq ( name, profile_url )`).eq("seq", seq).eq("del_yn", "N").single();
  }

  async incrementPostHit(seq) {
    return supabase.rpc("increment_hit", { row_id: seq });
  }

  async softDeletePost(seq, userSeq = null, isAdmin = false) {
    let query = supabase.from("board").update({ del_yn: "Y" }).eq("seq", seq);
    if (!isAdmin && userSeq) {
      query = query.eq("user_seq", userSeq);
    }
    return query;
  }

  async softDeletePosts(seqs) {
    return supabase.from("board").update({ del_yn: "Y" }).in("seq", seqs);
  }

  async insertPost(postData) {
    return supabase.from("board").insert([postData]).select();
  }

  async updatePost(seq, updateData, userSeq = null, isAdmin = false) {
    let query = supabase.from("board").update(updateData).eq("seq", seq);
    if (!isAdmin && userSeq) {
      query = query.eq("user_seq", userSeq);
    }
    return query;
  }

  async getPostCountByCategory(categorySeq) {
    return supabase.from("board").select("seq", { count: "exact", head: true }).eq("category_seq", categorySeq).eq("del_yn", "N");
  }

  async getRecentPostsByCategory(categorySeq, limit = 5) {
    return supabase.from("board").select(`seq, title, cre_date, user:user_seq ( name, profile_url )`).eq("category_seq", categorySeq).eq("del_yn", "N").order("seq", { ascending: false }).limit(limit);
  }

  async getRecentPostsByUserId(userSeq, limit = 5) {
    return supabase.from("board").select("*").eq("user_seq", userSeq).eq("del_yn", "N").order("seq", { ascending: false }).limit(limit);
  }

  async getRecentPosts(limit = 5) {
    return supabase.from("board").select(`seq, title, cre_date, user:user_seq ( name, profile_url )`).eq("del_yn", "N").order("seq", { ascending: false }).limit(limit);
  }

  async getBoardCount() {
    return supabase.from("board").select("*", { count: "exact", head: true }).eq("del_yn", "N");
  }

  getBoardQuery() {
    return supabase.from("board").select(`seq, title, cre_date, hit, user_seq, category_seq, user:user_seq(name, profile_url), category:category_seq(show_yn)`, { count: "exact" }).eq("del_yn", "N");
  }

  // ==========================================
  // Board Files
  // ==========================================
  async getBoardFiles(boardSeq) {
    return supabase.from("board_file").select("*").eq("board_seq", boardSeq).order("cre_date", { ascending: true });
  }

  async deleteBoardFiles(seqs) {
    return supabase.from("board_file").delete().in("seq", seqs);
  }

  async insertBoardFiles(filesData) {
    return supabase.from("board_file").insert(filesData);
  }

  // ==========================================
  // Board Comments
  // ==========================================
  async getCommentsByBoardSeq(boardSeq) {
    return supabase.from("board_comment").select(`*, user:user_seq ( name, profile_url )`).eq("board_seq", boardSeq).order("seq", { ascending: true });
  }

  async insertComment(commentData) {
    return supabase.from("board_comment").insert([commentData]);
  }

  async softDeleteComment(seq, userSeq = null, isAdmin = false) {
    let query = supabase.from("board_comment").update({ del_yn: "Y" }).eq("seq", seq);
    if (!isAdmin && userSeq) {
      query = query.eq("user_seq", userSeq);
    }
    return query;
  }

  async getRecentCommentsByUserId(userSeq, limit = 5) {
    return supabase.from("board_comment").select("*, board:board_seq(title)").eq("user_seq", userSeq).eq("del_yn", "N").order("seq", { ascending: false }).limit(limit);
  }

  // ==========================================
  // Messages
  // ==========================================
  async getMessagesByUserId(userId, type = "received") {
    let query = supabase
      .from("message")
      .select("*, sender:user!message_sender_seq_fkey(name), receiver:user!message_receiver_seq_fkey(name)")
      .neq("del_yn", "Y")
      .order("cre_date", { ascending: false });
    if (type === "received") {
      query = query.eq("receiver_seq", userId);
    } else {
      query = query.eq("sender_seq", userId);
    }
    return query;
  }

  async getUnreadMessageCount(userId) {
    return supabase.from("message").select("seq", { count: "exact", head: true }).eq("receiver_seq", userId).is("read_date", null).neq("del_yn", "Y");
  }

  async readMessages(seqs) {
    return supabase.from("message").update({ read_date: new Date().toISOString() }).in("seq", seqs).is("read_date", null);
  }

  async readAllMessages(userId) {
    return supabase.from("message").update({ read_date: new Date().toISOString() }).eq("receiver_seq", userId).is("read_date", null).neq("del_yn", "Y");
  }

  async insertMessage(messageData) {
    return supabase.from("message").insert([messageData]);
  }

  async softDeleteMessages(seqs) {
    return supabase.from("message").update({ del_yn: "Y" }).in("seq", seqs);
  }

  async softDeleteAllMessages(userId, type = "received") {
    let query = supabase.from("message").update({ del_yn: "Y" }).neq("del_yn", "Y");
    if (type === "received") {
      query = query.eq("receiver_seq", userId);
    } else {
      query = query.eq("sender_seq", userId);
    }
    return query;
  }

  // ==========================================
  // Notifications
  // ==========================================
  async getNotificationsByUserId(userId) {
    return supabase.from("notification").select("*").eq("user_seq", userId).neq("del_yn", "Y").order("cre_date", { ascending: false });
  }

  async getUnreadNotificationCount(userId) {
    return supabase.from("notification").select("seq", { count: "exact", head: true }).eq("user_seq", userId).is("read_date", null).neq("del_yn", "Y");
  }

  async insertNotification(notificationData) {
    return supabase.from("notification").insert([notificationData]);
  }

  async readNotifications(seqs) {
    return supabase.from("notification").update({ read_date: new Date().toISOString() }).in("seq", seqs).is("read_date", null);
  }

  async readAllNotifications(userId) {
    return supabase.from("notification").update({ read_date: new Date().toISOString() }).eq("user_seq", userId).is("read_date", null).neq("del_yn", "Y");
  }

  async softDeleteNotifications(seqs) {
    return supabase.from("notification").update({ del_yn: "Y" }).in("seq", seqs);
  }

  async softDeleteAllNotifications(userId) {
    return supabase.from("notification").update({ del_yn: "Y" }).eq("user_seq", userId).neq("del_yn", "Y");
  }

  // ==========================================
  // Roulette Game
  // ==========================================
  async getRouletteCandidates() {
    return supabase.from("roulette_list").select("*").eq("win_yn", "N").order("seq", { ascending: true });
  }

  async updateRouletteWinner(seq) {
    return supabase.from("roulette_list").update({ win_yn: "Y" }).eq("seq", seq);
  }

  async getAllRouletteParticipants() {
    return supabase.from("roulette_list").select("*").order("seq", { ascending: true });
  }

  async insertRouletteParticipant(data) {
    return supabase.from("roulette_list").insert([data]);
  }

  async updateRouletteParticipant(seq, updateData) {
    return supabase.from("roulette_list").update(updateData).eq("seq", seq);
  }

  async deleteRouletteParticipant(seq) {
    return supabase.from("roulette_list").delete().eq("seq", seq);
  }

  // ==========================================
  // Charts
  // ==========================================
  async getMonthlyUserYears() {
    return supabase.from("monthly_user_counts").select("year");
  }

  async getMonthlyUserCounts(year) {
    return supabase.from("monthly_user_counts").select("month, user_count").eq("year", year);
  }

  async getMonthlyPostYears() {
    return supabase.from("monthly_post_counts").select("year");
  }

  async getMonthlyPostCounts(year) {
    return supabase.from("monthly_post_counts").select("month, post_count").eq("year", year);
  }

  // ==========================================
  // YouTube Trending (DashBoard / Main)
  // ==========================================
  async getYoutubeTrending(type, limit = 4) {
    return supabase.from("youtube_trending").select("*").eq("type", type).order("seq", { ascending: false }).limit(limit);
  }

  async deleteYoutubeTrending() {
    return supabase.from("youtube_trending").delete().in("type", ["VIDEO", "MUSIC"]);
  }

  async insertYoutubeTrending(data) {
    return supabase.from("youtube_trending").insert(data);
  }

  // ==========================================
  // Storage
  // ==========================================
  async uploadFile(bucket, filePath, file) {
    return supabase.storage.from(bucket).upload(filePath, file);
  }

  getPublicUrl(bucket, filePath) {
    return supabase.storage.from(bucket).getPublicUrl(filePath);
  }
  // ==========================================
  // Schedule & Calendar
  // ==========================================
  // Categories
  async getScheduleCategories(userSeq) {
    let query = supabase.from("schedule_category").select("*").eq("del_yn", "N");
    if (userSeq) {
      query = query.or(`seq.eq.1,user_seq.eq.${userSeq}`);
    } else {
      query = query.eq("seq", 1);
    }
    return query.order("seq", { ascending: true });
  }

  async insertScheduleCategory(categoryData) {
    return supabase.from("schedule_category").insert([categoryData]).select();
  }

  async updateScheduleCategory(seq, updateData) {
    return supabase.from("schedule_category").update(updateData).eq("seq", seq);
  }

  async deleteScheduleCategory(seq) {
    return supabase.from("schedule_category").update({ del_yn: "Y" }).eq("seq", seq);
  }

  // Schedules
  async getSchedulesByDateRange(startDate, endDate, userSeq) {
    let query = supabase
      .from("schedule_list")
      .select(`*, repeat_yn, category:category_seq(category_name, default_color)`)
      .eq("del_yn", "N")
      .or(`and(end_datetime.gte.${startDate},start_datetime.lte.${endDate}),repeat_yn.eq.Y`);

    if (userSeq) {
      query = query.or(`category_seq.eq.1,user_seq.eq.${userSeq}`);
    } else {
      query = query.eq("category_seq", 1);
    }

    return query.order("start_datetime", { ascending: true });
  }

  async insertSchedule(scheduleData) {
    return supabase.from("schedule_list").insert([scheduleData]).select();
  }

  async updateSchedule(seq, updateData) {
    return supabase.from("schedule_list").update(updateData).eq("seq", seq);
  }

  async deleteSchedule(seq) {
    return supabase.from("schedule_list").update({ del_yn: "Y" }).eq("seq", seq);
  }
}

export const dbService = new DatabaseService();
