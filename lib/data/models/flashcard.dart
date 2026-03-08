class Flashcard {
  final String id;
  final String contentId;
  final String front;
  final String back;

  const Flashcard({
    required this.id,
    required this.contentId,
    required this.front,
    required this.back,
  });

  factory Flashcard.fromJson(Map<String, dynamic> json) {
    return Flashcard(
      id: json['id'] as String,
      contentId: json['content_id'] as String,
      front: json['front'] as String,
      back: json['back'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'content_id': contentId,
    'front': front,
    'back': back,
  };

  static Flashcard fromSupabase(Map<String, dynamic> row) {
    return Flashcard(
      id: row['id'] as String,
      contentId: row['content_id'] as String,
      front: row['front'] as String,
      back: row['back'] as String,
    );
  }
}
