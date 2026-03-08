class Quote {
  final String id;
  final String contentId;
  final String text;
  final String? timestamp;

  const Quote({
    required this.id,
    required this.contentId,
    required this.text,
    this.timestamp,
  });

  factory Quote.fromJson(Map<String, dynamic> json) {
    return Quote(
      id: json['id'] as String,
      contentId: json['content_id'] as String,
      text: json['text'] as String,
      timestamp: json['timestamp'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'content_id': contentId,
    'text': text,
    'timestamp': timestamp,
  };

  static Quote fromSupabase(Map<String, dynamic> row) {
    return Quote(
      id: row['id'] as String,
      contentId: row['content_id'] as String,
      text: row['text'] as String,
      timestamp: row['timestamp'] as String?,
    );
  }
}
