import 'category.dart';
import 'quote.dart';
import 'flashcard.dart';

class Content {
  final String id;
  final String title;
  final String? sourceUrl;
  final String? platform;
  final String? categoryId;
  final String? coverImageUrl;
  final bool isPublished;
  final DateTime createdAt;
  final Category? category;
  final List<Quote> quotes;
  final List<Flashcard> flashcards;

  const Content({
    required this.id,
    required this.title,
    this.sourceUrl,
    this.platform,
    this.categoryId,
    this.coverImageUrl,
    this.isPublished = false,
    required this.createdAt,
    this.category,
    this.quotes = const [],
    this.flashcards = const [],
  });

  factory Content.fromJson(Map<String, dynamic> json) {
    return Content(
      id: json['id'] as String,
      title: json['title'] as String,
      sourceUrl: json['source_url'] as String?,
      platform: json['platform'] as String?,
      categoryId: json['category_id'] as String?,
      coverImageUrl: json['cover_image_url'] as String?,
      isPublished: json['is_published'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      category: json['category'] != null 
          ? Category.fromJson(json['category'] as Map<String, dynamic>)
          : null,
      quotes: (json['quotes'] as List<dynamic>?)
          ?.map((q) => Quote.fromJson(q as Map<String, dynamic>))
          .toList() ?? [],
      flashcards: (json['flashcards'] as List<dynamic>?)
          ?.map((f) => Flashcard.fromJson(f as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'source_url': sourceUrl,
    'platform': platform,
    'category_id': categoryId,
    'cover_image_url': coverImageUrl,
    'is_published': isPublished,
    'created_at': createdAt.toIso8601String(),
  };

  static Content fromSupabase(Map<String, dynamic> row) {
    return Content(
      id: row['id'] as String,
      title: row['title'] as String,
      sourceUrl: row['source_url'] as String?,
      platform: row['platform'] as String?,
      categoryId: row['category_id'] as String?,
      coverImageUrl: row['cover_image_url'] as String?,
      isPublished: row['is_published'] as bool? ?? false,
      createdAt: DateTime.parse(row['created_at'] as String),
    );
  }

  Content copyWith({
    String? id,
    String? title,
    String? sourceUrl,
    String? platform,
    String? categoryId,
    String? coverImageUrl,
    bool? isPublished,
    DateTime? createdAt,
    Category? category,
    List<Quote>? quotes,
    List<Flashcard>? flashcards,
  }) {
    return Content(
      id: id ?? this.id,
      title: title ?? this.title,
      sourceUrl: sourceUrl ?? this.sourceUrl,
      platform: platform ?? this.platform,
      categoryId: categoryId ?? this.categoryId,
      coverImageUrl: coverImageUrl ?? this.coverImageUrl,
      isPublished: isPublished ?? this.isPublished,
      createdAt: createdAt ?? this.createdAt,
      category: category ?? this.category,
      quotes: quotes ?? this.quotes,
      flashcards: flashcards ?? this.flashcards,
    );
  }
}
