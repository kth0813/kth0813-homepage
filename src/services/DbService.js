import { sql } from "../neonClient";

class DatabaseService {
  constructor() {
    this.fileCache = {};
  }

  // ==========================================
  // User & Auth
  // ==========================================
  async getUserById(id) {
    try {
      const rows = await sql`SELECT * FROM "user" WHERE id = ${id}`;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("getUserById error:", error);
      return { data: null, error };
    }
  }

  async getUserBySeq(seq) {
    try {
      const rows = await sql`SELECT * FROM "user" WHERE seq = ${seq}`;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("getUserBySeq error:", error);
      return { data: null, error };
    }
  }

  async getUsersList({ page = 1, pageSize = 10, searchType = "id", searchKeyword = "" }) {
    try {
      const offset = (page - 1) * pageSize;
      let countRows;
      let dataRows;

      const keywordParam = `%${searchKeyword.trim()}%`;
      if (searchKeyword.trim()) {
        if (searchType === "name") {
          countRows = await sql`SELECT COUNT(*) FROM "user" WHERE del_yn = 'N' AND name ILIKE ${keywordParam}`;
          dataRows = await sql`SELECT seq, id, name, profile_url, cre_date, admin_yn FROM "user" WHERE del_yn = 'N' AND name ILIKE ${keywordParam} ORDER BY seq DESC LIMIT ${pageSize} OFFSET ${offset}`;
        } else {
          countRows = await sql`SELECT COUNT(*) FROM "user" WHERE del_yn = 'N' AND id ILIKE ${keywordParam}`;
          dataRows = await sql`SELECT seq, id, name, profile_url, cre_date, admin_yn FROM "user" WHERE del_yn = 'N' AND id ILIKE ${keywordParam} ORDER BY seq DESC LIMIT ${pageSize} OFFSET ${offset}`;
        }
      } else {
        countRows = await sql`SELECT COUNT(*) FROM "user" WHERE del_yn = 'N'`;
        dataRows = await sql`SELECT seq, id, name, profile_url, cre_date, admin_yn FROM "user" WHERE del_yn = 'N' ORDER BY seq DESC LIMIT ${pageSize} OFFSET ${offset}`;
      }

      const count = parseInt(countRows[0]?.count || "0", 10);
      return { data: dataRows, count, error: null };
    } catch (error) {
      console.error("getUsersList error:", error);
      return { data: [], count: 0, error };
    }
  }

  getUsersQuery() {
    const service = this;
    return {
      _searchType: "id",
      _searchKeyword: "",
      _page: 1,
      _pageSize: 10,
      order() {
        return this;
      },
      range(from, to) {
        this._page = Math.floor(from / (to - from + 1)) + 1;
        this._pageSize = to - from + 1;
        return this;
      },
      ilike(column, keyword) {
        this._searchType = column;
        this._searchKeyword = keyword.replace(/%/g, "");
        return this;
      },
      then(resolve, reject) {
        service
          .getUsersList({
            page: this._page,
            pageSize: this._pageSize,
            searchType: this._searchType,
            searchKeyword: this._searchKeyword
          })
          .then(resolve, reject);
      }
    };
  }

  async getUserCount() {
    try {
      const rows = await sql`SELECT COUNT(*) FROM "user" WHERE del_yn = 'N'`;
      return { count: parseInt(rows[0]?.count || "0", 10), error: null };
    } catch (error) {
      return { count: 0, error };
    }
  }

  async getAllUsers() {
    try {
      const rows = await sql`SELECT * FROM "user" ORDER BY cre_date DESC`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async searchUserById(keyword) {
    try {
      const param = `%${keyword.trim()}%`;
      const rows = await sql`SELECT seq, id, name FROM "user" WHERE id ILIKE ${param} AND del_yn = 'N'`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertUser(userData) {
    try {
      const { id, pwd, name, profile_url, admin_yn } = userData;
      const rows = await sql`
        INSERT INTO "user" (id, pwd, name, profile_url, admin_yn, del_yn, pwd_version, cre_date)
        VALUES (${id}, ${pwd}, ${name}, ${profile_url || null}, ${admin_yn || 'N'}, 'N', 1, NOW())
        RETURNING *
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("insertUser error:", error);
      return { data: null, error };
    }
  }

  async updateUser(seq, updateData) {
    try {
      const keys = Object.keys(updateData);
      if (keys.length === 0) return { data: null, error: null };

      const name = updateData.name !== undefined ? updateData.name : null;
      const pwd = updateData.pwd !== undefined ? updateData.pwd : null;
      const profile_url = updateData.profile_url !== undefined ? updateData.profile_url : null;
      const admin_yn = updateData.admin_yn !== undefined ? updateData.admin_yn : null;
      const del_yn = updateData.del_yn !== undefined ? updateData.del_yn : null;

      const rows = await sql`
        UPDATE "user"
        SET name = COALESCE(${name}, name),
            pwd = COALESCE(${pwd}, pwd),
            profile_url = COALESCE(${profile_url}, profile_url),
            admin_yn = COALESCE(${admin_yn}, admin_yn),
            del_yn = COALESCE(${del_yn}, del_yn)
        WHERE seq = ${seq}
        RETURNING *
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("updateUser error:", error);
      return { data: null, error };
    }
  }

  // ==========================================
  // Category
  // ==========================================
  async getCategories() {
    try {
      const rows = await sql`
        SELECT * FROM category WHERE del_yn = 'N' ORDER BY "order" ASC NULLS LAST, seq ASC
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getPublicCategories() {
    try {
      const rows = await sql`
        SELECT * FROM category WHERE del_yn = 'N' AND show_yn = 'Y' ORDER BY "order" ASC NULLS LAST, seq ASC
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCategory(seq) {
    try {
      const rows = await sql`SELECT * FROM category WHERE seq = ${seq}`;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getAllCategoriesIncludeDeleted() {
    try {
      const rows = await sql`SELECT * FROM category ORDER BY "order" ASC NULLS LAST, seq ASC`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCategoryByName(name) {
    try {
      const rows = await sql`SELECT * FROM category WHERE name = ${name} AND del_yn = 'N'`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCategoryByOrder(order) {
    try {
      const rows = await sql`SELECT * FROM category WHERE "order" = ${order} AND del_yn = 'N'`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCategoriesForWrite(isAdmin) {
    try {
      let rows;
      if (!isAdmin) {
        rows = await sql`SELECT * FROM category WHERE seq = 1 ORDER BY seq ASC`;
      } else {
        rows = await sql`SELECT * FROM category ORDER BY seq ASC`;
      }
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMaxCategoryOrder() {
    try {
      const rows = await sql`SELECT "order" FROM category WHERE del_yn = 'N' ORDER BY "order" DESC LIMIT 1`;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertCategory(categoryData) {
    try {
      const { name, description, order, show_yn, del_yn } = categoryData;
      const rows = await sql`
        INSERT INTO category (name, description, "order", show_yn, del_yn)
        VALUES (${name}, ${description || null}, ${order || null}, ${show_yn || 'Y'}, ${del_yn || 'N'})
        RETURNING *
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("insertCategory error:", error);
      return { data: null, error };
    }
  }

  async updateCategory(seq, updateData) {
    try {
      const { name, description, order, show_yn, del_yn } = updateData;
      const rows = await sql`
        UPDATE category
        SET name = COALESCE(${name !== undefined ? name : null}, name),
            description = COALESCE(${description !== undefined ? description : null}, description),
            "order" = COALESCE(${order !== undefined ? order : null}, "order"),
            show_yn = COALESCE(${show_yn !== undefined ? show_yn : null}, show_yn),
            del_yn = COALESCE(${del_yn !== undefined ? del_yn : null}, del_yn)
        WHERE seq = ${seq}
        RETURNING *
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // ==========================================
  // Board (Posts)
  // ==========================================
  async getPostBySeq(seq) {
    try {
      const rows = await sql`
        SELECT b.*, json_build_object('name', u.name, 'profile_url', u.profile_url) AS "user"
        FROM board b
        LEFT JOIN "user" u ON b.user_seq = u.seq
        WHERE b.seq = ${seq} AND b.del_yn = 'N'
      `;
      if (rows[0]) {
        const p = rows[0];
        if (typeof p.user === "string") {
          try { p.user = JSON.parse(p.user); } catch (e) {}
        }
      }
      return { data: rows[0] || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async incrementPostHit(seq) {
    try {
      const rows = await sql`UPDATE board SET hit = COALESCE(hit, 0) + 1 WHERE seq = ${seq} RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async softDeletePost(seq, userSeq = null, isAdmin = false) {
    try {
      let rows;
      if (!isAdmin && userSeq) {
        rows = await sql`UPDATE board SET del_yn = 'Y' WHERE seq = ${seq} AND user_seq = ${userSeq} RETURNING *`;
      } else {
        rows = await sql`UPDATE board SET del_yn = 'Y' WHERE seq = ${seq} RETURNING *`;
      }
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async softDeletePosts(seqs) {
    try {
      if (!seqs || seqs.length === 0) return { data: [], error: null };
      const rows = await sql`UPDATE board SET del_yn = 'Y' WHERE seq = ANY(${seqs}) RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertPost(postData) {
    try {
      const { title, contents, user_seq, category_seq } = postData;
      const rows = await sql`
        INSERT INTO board (title, contents, user_seq, category_seq, del_yn, hit, cre_date)
        VALUES (${title}, ${contents}, ${user_seq}, ${category_seq || 1}, 'N', 0, NOW())
        RETURNING *
      `;
      return { data: rows, error: null };
    } catch (error) {
      console.error("insertPost error:", error);
      return { data: null, error };
    }
  }

  async updatePost(seq, updateData, userSeq = null, isAdmin = false) {
    try {
      const { title, contents, category_seq } = updateData;
      let rows;
      if (!isAdmin && userSeq) {
        rows = await sql`
          UPDATE board
          SET title = ${title}, contents = ${contents}, category_seq = ${category_seq}, mod_date = NOW()
          WHERE seq = ${seq} AND user_seq = ${userSeq}
          RETURNING *
        `;
      } else {
        rows = await sql`
          UPDATE board
          SET title = ${title}, contents = ${contents}, category_seq = ${category_seq}, mod_date = NOW()
          WHERE seq = ${seq}
          RETURNING *
        `;
      }
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getPostCountByCategory(categorySeq) {
    try {
      const rows = await sql`SELECT COUNT(*) FROM board WHERE category_seq = ${categorySeq} AND del_yn = 'N'`;
      return { count: parseInt(rows[0]?.count || "0", 10), error: null };
    } catch (error) {
      return { count: 0, error };
    }
  }

  async getRecentPostsByCategory(categorySeq, limit = 5) {
    try {
      const rows = await sql`
        SELECT b.seq, b.title, b.cre_date, json_build_object('name', u.name, 'profile_url', u.profile_url) AS "user"
        FROM board b
        LEFT JOIN "user" u ON b.user_seq = u.seq
        WHERE b.category_seq = ${categorySeq} AND b.del_yn = 'N'
        ORDER BY b.seq DESC
        LIMIT ${limit}
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getRecentPostsByUserId(userSeq, limit = 5) {
    try {
      const rows = await sql`
        SELECT * FROM board WHERE user_seq = ${userSeq} AND del_yn = 'N' ORDER BY seq DESC LIMIT ${limit}
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getRecentPosts(limit = 5) {
    try {
      const rows = await sql`
        SELECT b.seq, b.title, b.cre_date, json_build_object('name', u.name, 'profile_url', u.profile_url) AS "user"
        FROM board b
        LEFT JOIN "user" u ON b.user_seq = u.seq
        WHERE b.del_yn = 'N'
        ORDER BY b.seq DESC
        LIMIT ${limit}
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getBoardCount() {
    try {
      const rows = await sql`SELECT COUNT(*) FROM board WHERE del_yn = 'N'`;
      return { count: parseInt(rows[0]?.count || "0", 10), error: null };
    } catch (error) {
      return { count: 0, error };
    }
  }

  async getBoardList({ page = 1, pageSize = 10, category = null, globalKeyword = null, searchType = "title", searchKeyword = "", isAdmin = false }) {
    try {
      const offset = (page - 1) * pageSize;
      const params = [];
      let paramIdx = 1;

      let whereClause = "WHERE b.del_yn = 'N'";

      if (category) {
        whereClause += ` AND b.category_seq = $${paramIdx++}`;
        params.push(Number(category));
      }

      if (!isAdmin) {
        whereClause += ` AND (c.show_yn = 'Y' OR c.seq IS NULL)`;
      }

      if (globalKeyword && globalKeyword.trim()) {
        const kw = `%${globalKeyword.trim()}%`;
        whereClause += ` AND (b.title ILIKE $${paramIdx} OR b.contents ILIKE $${paramIdx})`;
        paramIdx++;
        params.push(kw);
      } else if (searchKeyword && searchKeyword.trim()) {
        const kw = `%${searchKeyword.trim()}%`;
        if (searchType === "title_contents") {
          whereClause += ` AND (b.title ILIKE $${paramIdx} OR b.contents ILIKE $${paramIdx})`;
          paramIdx++;
          params.push(kw);
        } else if (searchType === "author") {
          whereClause += ` AND u.name ILIKE $${paramIdx++}`;
          params.push(kw);
        } else {
          whereClause += ` AND b.title ILIKE $${paramIdx++}`;
          params.push(kw);
        }
      }

      const countQuery = `
        SELECT COUNT(*)
        FROM board b
        LEFT JOIN category c ON b.category_seq = c.seq
        LEFT JOIN "user" u ON b.user_seq = u.seq
        ${whereClause}
      `;

      const dataQuery = `
        SELECT b.seq, b.title, b.cre_date, b.hit, b.user_seq, b.category_seq,
               json_build_object('name', u.name, 'profile_url', u.profile_url) AS "user",
               json_build_object('show_yn', c.show_yn) AS "category"
        FROM board b
        LEFT JOIN category c ON b.category_seq = c.seq
        LEFT JOIN "user" u ON b.user_seq = u.seq
        ${whereClause}
        ORDER BY b.seq DESC
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}
      `;

      const countResult = await sql(countQuery, params);
      const dataResult = await sql(dataQuery, [...params, pageSize, offset]);

      const parsedData = dataResult.map((row) => {
        let user = row.user;
        let category = row.category;
        if (typeof user === "string") {
          try { user = JSON.parse(user); } catch (e) {}
        }
        if (typeof category === "string") {
          try { category = JSON.parse(category); } catch (e) {}
        }
        return { ...row, user, category };
      });

      const count = parseInt(countResult[0]?.count || "0", 10);
      return { data: parsedData, count, error: null };
    } catch (error) {
      console.error("getBoardList error:", error);
      return { data: [], count: 0, error };
    }
  }

  getBoardQuery() {
    const service = this;
    return {
      _category: null,
      _showYn: null,
      _orClause: null,
      _ilikeCol: null,
      _ilikeKw: null,
      _page: 1,
      _pageSize: 10,
      eq(col, val) {
        if (col === "category_seq") this._category = val;
        if (col === "category.show_yn") this._showYn = val;
        return this;
      },
      or(clause) {
        this._orClause = clause;
        return this;
      },
      ilike(col, kw) {
        this._ilikeCol = col;
        this._ilikeKw = kw;
        return this;
      },
      order() {
        return this;
      },
      range(from, to) {
        this._page = Math.floor(from / (to - from + 1)) + 1;
        this._pageSize = to - from + 1;
        return this;
      },
      then(resolve, reject) {
        let globalKw = null;
        let searchKw = "";
        let searchT = "title";

        if (this._orClause) {
          const match = this._orClause.match(/%([^%]+)%/);
          if (match) globalKw = match[1];
        } else if (this._ilikeKw) {
          searchKw = this._ilikeKw.replace(/%/g, "");
          searchT = this._ilikeCol || "title";
        }

        service
          .getBoardList({
            page: this._page,
            pageSize: this._pageSize,
            category: this._category,
            globalKeyword: globalKw,
            searchType: searchT,
            searchKeyword: searchKw,
            isAdmin: this._showYn !== "Y"
          })
          .then(resolve, reject);
      }
    };
  }

  // ==========================================
  // Board Files
  // ==========================================
  async getBoardFiles(boardSeq) {
    try {
      const rows = await sql`
        SELECT * FROM board_file WHERE board_seq = ${boardSeq} ORDER BY cre_date ASC
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteBoardFiles(seqs) {
    try {
      if (!seqs || seqs.length === 0) return { data: [], error: null };
      const rows = await sql`DELETE FROM board_file WHERE seq = ANY(${seqs}) RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertBoardFiles(filesData) {
    try {
      if (!filesData || filesData.length === 0) return { data: [], error: null };
      const inserted = [];
      for (const item of filesData) {
        const { board_seq, file_name, file_url, file_type, file_size } = item;
        const rows = await sql`
          INSERT INTO board_file (board_seq, file_name, file_url, file_type, file_size, cre_date)
          VALUES (${board_seq}, ${file_name}, ${file_url}, ${file_type || null}, ${file_size || 0}, NOW())
          RETURNING *
        `;
        if (rows[0]) inserted.push(rows[0]);
      }
      return { data: inserted, error: null };
    } catch (error) {
      console.error("insertBoardFiles error:", error);
      return { data: null, error };
    }
  }

  // ==========================================
  // Board Comments
  // ==========================================
  async getCommentsByBoardSeq(boardSeq) {
    try {
      const rows = await sql`
        SELECT c.seq, c.board_seq, c.user_seq, c.contents, c.contents AS comment, c.del_yn, c.cre_date, c.mod_date,
               json_build_object('name', u.name, 'profile_url', u.profile_url) AS "user"
        FROM board_comment c
        LEFT JOIN "user" u ON c.user_seq = u.seq
        WHERE c.board_seq = ${boardSeq}
        ORDER BY c.seq ASC
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertComment(commentData) {
    try {
      const { board_seq, user_seq, comment, contents } = commentData;
      const commentText = comment || contents;
      const rows = await sql`
        INSERT INTO board_comment (board_seq, user_seq, contents, del_yn, cre_date)
        VALUES (${board_seq}, ${user_seq}, ${commentText}, 'N', NOW())
        RETURNING seq, board_seq, user_seq, contents, contents AS comment, del_yn, cre_date
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("insertComment error:", error);
      return { data: null, error };
    }
  }

  async softDeleteComment(seq, userSeq = null, isAdmin = false) {
    try {
      let rows;
      if (!isAdmin && userSeq) {
        rows = await sql`UPDATE board_comment SET del_yn = 'Y' WHERE seq = ${seq} AND user_seq = ${userSeq} RETURNING *`;
      } else {
        rows = await sql`UPDATE board_comment SET del_yn = 'Y' WHERE seq = ${seq} RETURNING *`;
      }
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getRecentCommentsByUserId(userSeq, limit = 5) {
    try {
      const rows = await sql`
        SELECT c.*, c.contents AS comment, json_build_object('title', b.title) AS board
        FROM board_comment c
        LEFT JOIN board b ON c.board_seq = b.seq
        WHERE c.user_seq = ${userSeq} AND c.del_yn = 'N'
        ORDER BY c.seq DESC
        LIMIT ${limit}
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // ==========================================
  // Messages
  // ==========================================
  async getMessagesByUserId(userId, type = "received") {
    try {
      let rows;
      if (type === "received") {
        rows = await sql`
          SELECT m.*,
                 json_build_object('name', s.name) AS sender,
                 json_build_object('name', r.name) AS receiver
          FROM message m
          LEFT JOIN "user" s ON m.sender_seq = s.seq
          LEFT JOIN "user" r ON m.receiver_seq = r.seq
          WHERE m.receiver_seq = ${userId} AND (m.del_yn IS NULL OR m.del_yn != 'Y')
          ORDER BY m.cre_date DESC
        `;
      } else {
        rows = await sql`
          SELECT m.*,
                 json_build_object('name', s.name) AS sender,
                 json_build_object('name', r.name) AS receiver
          FROM message m
          LEFT JOIN "user" s ON m.sender_seq = s.seq
          LEFT JOIN "user" r ON m.receiver_seq = r.seq
          WHERE m.sender_seq = ${userId} AND (m.del_yn IS NULL OR m.del_yn != 'Y')
          ORDER BY m.cre_date DESC
        `;
      }
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getUnreadMessageCount(userId) {
    try {
      const rows = await sql`
        SELECT COUNT(*) FROM message WHERE receiver_seq = ${userId} AND read_date IS NULL AND (del_yn IS NULL OR del_yn != 'Y')
      `;
      return { count: parseInt(rows[0]?.count || "0", 10), error: null };
    } catch (error) {
      return { count: 0, error };
    }
  }

  async readMessages(seqs) {
    try {
      if (!seqs || seqs.length === 0) return { data: [], error: null };
      const rows = await sql`
        UPDATE message SET read_date = NOW() WHERE seq = ANY(${seqs}) AND read_date IS NULL RETURNING *
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async readAllMessages(userId) {
    try {
      const rows = await sql`
        UPDATE message SET read_date = NOW() WHERE receiver_seq = ${userId} AND read_date IS NULL AND (del_yn IS NULL OR del_yn != 'Y') RETURNING *
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertMessage(messageData) {
    try {
      const { sender_seq, receiver_seq, content } = messageData;
      const rows = await sql`
        INSERT INTO message (sender_seq, receiver_seq, content, del_yn, cre_date)
        VALUES (${sender_seq}, ${receiver_seq}, ${content}, 'N', NOW())
        RETURNING *
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("insertMessage error:", error);
      return { data: null, error };
    }
  }

  async softDeleteMessages(seqs) {
    try {
      if (!seqs || seqs.length === 0) return { data: [], error: null };
      const rows = await sql`UPDATE message SET del_yn = 'Y' WHERE seq = ANY(${seqs}) RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async softDeleteAllMessages(userId, type = "received") {
    try {
      let rows;
      if (type === "received") {
        rows = await sql`UPDATE message SET del_yn = 'Y' WHERE receiver_seq = ${userId} RETURNING *`;
      } else {
        rows = await sql`UPDATE message SET del_yn = 'Y' WHERE sender_seq = ${userId} RETURNING *`;
      }
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // ==========================================
  // Notifications
  // ==========================================
  async getNotificationsByUserId(userId) {
    try {
      const rows = await sql`
        SELECT * FROM notification WHERE user_seq = ${userId} AND (del_yn IS NULL OR del_yn != 'Y') ORDER BY cre_date DESC
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getUnreadNotificationCount(userId) {
    try {
      const rows = await sql`
        SELECT COUNT(*) FROM notification WHERE user_seq = ${userId} AND read_date IS NULL AND (del_yn IS NULL OR del_yn != 'Y')
      `;
      return { count: parseInt(rows[0]?.count || "0", 10), error: null };
    } catch (error) {
      return { count: 0, error };
    }
  }

  async insertNotification(notificationData) {
    try {
      const { user_seq, title, content, message, type, link, target_seq } = notificationData;
      const msg = message || content || title || "";
      let targetSeq = target_seq || null;
      if (!targetSeq && link) {
        const num = parseInt(String(link).replace(/[^0-9]/g, ""), 10);
        if (!isNaN(num)) targetSeq = num;
      }
      const rows = await sql`
        INSERT INTO notification (user_seq, message, target_seq, type, del_yn, cre_date)
        VALUES (${user_seq}, ${msg}, ${targetSeq}, ${type || 'SYSTEM'}, 'N', NOW())
        RETURNING *
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("insertNotification error:", error);
      return { data: null, error };
    }
  }

  async readNotifications(seqs) {
    try {
      if (!seqs || seqs.length === 0) return { data: [], error: null };
      const rows = await sql`
        UPDATE notification SET read_date = NOW() WHERE seq = ANY(${seqs}) AND read_date IS NULL RETURNING *
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async readAllNotifications(userId) {
    try {
      const rows = await sql`
        UPDATE notification SET read_date = NOW() WHERE user_seq = ${userId} AND read_date IS NULL AND (del_yn IS NULL OR del_yn != 'Y') RETURNING *
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async softDeleteNotifications(seqs) {
    try {
      if (!seqs || seqs.length === 0) return { data: [], error: null };
      const rows = await sql`UPDATE notification SET del_yn = 'Y' WHERE seq = ANY(${seqs}) RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async softDeleteAllNotifications(userId) {
    try {
      const rows = await sql`UPDATE notification SET del_yn = 'Y' WHERE user_seq = ${userId} RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // ==========================================
  // Roulette Game
  // ==========================================
  async getRouletteCandidates() {
    try {
      const rows = await sql`
        SELECT seq, user_name, user_name AS name, gender, win_yn FROM roulette_list WHERE win_yn = 'N' ORDER BY seq ASC
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateRouletteWinner(seq) {
    try {
      const rows = await sql`
        UPDATE roulette_list SET win_yn = 'Y' WHERE seq = ${seq} RETURNING seq, user_name, user_name AS name, gender, win_yn
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getAllRouletteParticipants() {
    try {
      const rows = await sql`
        SELECT seq, user_name, user_name AS name, gender, win_yn FROM roulette_list ORDER BY user_name ASC
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertRouletteParticipant(data) {
    try {
      const { name, user_name, win_yn, gender } = data;
      const userName = user_name || name;
      const rows = await sql`
        INSERT INTO roulette_list (user_name, win_yn, gender)
        VALUES (${userName}, ${win_yn || 'N'}, ${gender || null})
        RETURNING seq, user_name, user_name AS name, gender, win_yn
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("insertRouletteParticipant error:", error);
      return { data: null, error };
    }
  }

  async updateRouletteParticipant(seq, updateData) {
    try {
      const { name, user_name, win_yn } = updateData;
      const userName = user_name || name;
      const rows = await sql`
        UPDATE roulette_list
        SET user_name = COALESCE(${userName !== undefined ? userName : null}, user_name),
            win_yn = COALESCE(${win_yn !== undefined ? win_yn : null}, win_yn)
        WHERE seq = ${seq}
        RETURNING seq, user_name, user_name AS name, gender, win_yn
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteRouletteParticipant(seq) {
    try {
      const rows = await sql`
        DELETE FROM roulette_list WHERE seq = ${seq} RETURNING seq, user_name, user_name AS name, gender, win_yn
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // ==========================================
  // Charts
  // ==========================================
  async getMonthlyUserYears() {
    try {
      const rows = await sql`SELECT DISTINCT year FROM monthly_user_counts ORDER BY year DESC`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMonthlyUserCounts(year) {
    try {
      const rows = await sql`SELECT month, user_count FROM monthly_user_counts WHERE year = ${year} ORDER BY month ASC`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMonthlyPostYears() {
    try {
      const rows = await sql`SELECT DISTINCT year FROM monthly_post_counts ORDER BY year DESC`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMonthlyPostCounts(year) {
    try {
      const rows = await sql`SELECT month, post_count FROM monthly_post_counts WHERE year = ${year} ORDER BY month ASC`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // ==========================================
  // YouTube Trending (DashBoard / Main)
  // ==========================================
  async getYoutubeTrending(type, limit = 4) {
    try {
      const rows = await sql`
        SELECT * FROM youtube_trending WHERE type = ${type} ORDER BY seq DESC LIMIT ${limit}
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteYoutubeTrending() {
    try {
      const rows = await sql`DELETE FROM youtube_trending WHERE type IN ('VIDEO', 'MUSIC') RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertYoutubeTrending(data) {
    try {
      if (!data || data.length === 0) return { data: [], error: null };
      const inserted = [];
      for (const item of data) {
        const { type, title, url, thumbnail, video_id, thumbnail_url, channel_title, view_count } = item;
        const vId = video_id || url || null;
        const thumb = thumbnail_url || thumbnail || null;
        const rows = await sql`
          INSERT INTO youtube_trending (type, title, video_id, thumbnail_url, channel_title, view_count, cre_date)
          VALUES (${type}, ${title}, ${vId}, ${thumb}, ${channel_title || null}, ${view_count ? parseInt(view_count, 10) : 0}, NOW())
          RETURNING *
        `;
        if (rows[0]) inserted.push(rows[0]);
      }
      return { data: inserted, error: null };
    } catch (error) {
      console.error("insertYoutubeTrending error:", error);
      return { data: null, error };
    }
  }

  // ==========================================
  // Storage (Base64 Data URL)
  // ==========================================
  async uploadFile(bucket, filePath, file) {
    return new Promise((resolve) => {
      if (typeof file === "string") {
        this.fileCache[filePath] = file;
        resolve({ data: { path: filePath, publicUrl: file }, error: null });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        this.fileCache[filePath] = dataUrl;
        resolve({ data: { path: filePath, publicUrl: dataUrl }, error: null });
      };
      reader.onerror = (error) => {
        resolve({ data: null, error });
      };
      reader.readAsDataURL(file);
    });
  }

  getPublicUrl(bucket, filePath) {
    const publicUrl = this.fileCache[filePath] || filePath;
    return { data: { publicUrl } };
  }

  // ==========================================
  // Schedule & Calendar
  // ==========================================
  async getScheduleCategories(userSeq) {
    try {
      let rows;
      if (userSeq) {
        rows = await sql`
          SELECT * FROM schedule_category WHERE del_yn = 'N' AND (seq = 1 OR user_seq = ${userSeq}) ORDER BY seq ASC
        `;
      } else {
        rows = await sql`
          SELECT * FROM schedule_category WHERE del_yn = 'N' AND seq = 1 ORDER BY seq ASC
        `;
      }
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertScheduleCategory(categoryData) {
    try {
      const { category_name, default_color, user_seq } = categoryData;
      const rows = await sql`
        INSERT INTO schedule_category (category_name, default_color, user_seq, del_yn)
        VALUES (${category_name}, ${default_color || '#3788d8'}, ${user_seq || null}, 'N')
        RETURNING *
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("insertScheduleCategory error:", error);
      return { data: null, error };
    }
  }

  async updateScheduleCategory(seq, updateData) {
    try {
      const { category_name, default_color } = updateData;
      const rows = await sql`
        UPDATE schedule_category
        SET category_name = COALESCE(${category_name !== undefined ? category_name : null}, category_name),
            default_color = COALESCE(${default_color !== undefined ? default_color : null}, default_color)
        WHERE seq = ${seq}
        RETURNING *
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteScheduleCategory(seq) {
    try {
      const rows = await sql`UPDATE schedule_category SET del_yn = 'Y' WHERE seq = ${seq} RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getSchedulesByDateRange(startDate, endDate, userSeq) {
    try {
      let rows;
      if (userSeq) {
        rows = await sql`
          SELECT s.*, s.repeat_yn,
                 json_build_object('category_name', c.category_name, 'default_color', c.default_color) AS category
          FROM schedule_list s
          LEFT JOIN schedule_category c ON s.category_seq = c.seq
          WHERE s.del_yn = 'N'
            AND ((s.end_datetime >= ${startDate} AND s.start_datetime <= ${endDate}) OR s.repeat_yn = 'Y')
            AND (s.category_seq = 1 OR s.user_seq = ${userSeq})
          ORDER BY s.start_datetime ASC
        `;
      } else {
        rows = await sql`
          SELECT s.*, s.repeat_yn,
                 json_build_object('category_name', c.category_name, 'default_color', c.default_color) AS category
          FROM schedule_list s
          LEFT JOIN schedule_category c ON s.category_seq = c.seq
          WHERE s.del_yn = 'N'
            AND ((s.end_datetime >= ${startDate} AND s.start_datetime <= ${endDate}) OR s.repeat_yn = 'Y')
            AND s.category_seq = 1
          ORDER BY s.start_datetime ASC
        `;
      }
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insertSchedule(scheduleData) {
    try {
      const { title, start_datetime, end_datetime, category_seq, user_seq, repeat_yn } = scheduleData;
      const rows = await sql`
        INSERT INTO schedule_list (title, start_datetime, end_datetime, category_seq, user_seq, repeat_yn, del_yn, cre_date)
        VALUES (${title}, ${start_datetime}, ${end_datetime}, ${category_seq || 1}, ${user_seq || null}, ${repeat_yn || 'N'}, 'N', NOW())
        RETURNING *
      `;
      return { data: rows[0] || null, error: null };
    } catch (error) {
      console.error("insertSchedule error:", error);
      return { data: null, error };
    }
  }

  async updateSchedule(seq, updateData) {
    try {
      const { title, start_datetime, end_datetime, category_seq, repeat_yn } = updateData;
      const rows = await sql`
        UPDATE schedule_list
        SET title = COALESCE(${title !== undefined ? title : null}, title),
            start_datetime = COALESCE(${start_datetime !== undefined ? start_datetime : null}, start_datetime),
            end_datetime = COALESCE(${end_datetime !== undefined ? end_datetime : null}, end_datetime),
            category_seq = COALESCE(${category_seq !== undefined ? category_seq : null}, category_seq),
            repeat_yn = COALESCE(${repeat_yn !== undefined ? repeat_yn : null}, repeat_yn)
        WHERE seq = ${seq}
        RETURNING *
      `;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteSchedule(seq) {
    try {
      const rows = await sql`UPDATE schedule_list SET del_yn = 'Y' WHERE seq = ${seq} RETURNING *`;
      return { data: rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const dbService = new DatabaseService();
