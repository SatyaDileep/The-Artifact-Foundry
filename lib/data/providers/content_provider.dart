import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/content.dart';
import '../models/category.dart';
import '../models/quote.dart';
import '../models/flashcard.dart';

final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final supabase = ref.watch(supabaseProvider);
  final response = await supabase.from('categories').select();
  return response.map((row) => Category.fromSupabase(row)).toList();
});

final contentsProvider = FutureProvider<List<Content>>((ref) async {
  final supabase = ref.watch(supabaseProvider);
  final response = await supabase
      .from('content')
      .select()
      .eq('is_published', true)
      .order('created_at', ascending: false);
  return response.map((row) => Content.fromSupabase(row)).toList();
});

final contentDetailProvider = FutureProvider.family<Content, String>((ref, id) async {
  final supabase = ref.watch(supabaseProvider);
  
  final contentResponse = await supabase
      .from('content')
      .select()
      .eq('id', id)
      .single();
  
  final content = Content.fromSupabase(contentResponse);
  
  final quotesResponse = await supabase
      .from('quotes')
      .select()
      .eq('content_id', id);
  final quotes = quotesResponse.map((row) => Quote.fromSupabase(row)).toList();
  
  final flashcardsResponse = await supabase
      .from('flashcards')
      .select()
      .eq('content_id', id);
  final flashcards = flashcardsResponse.map((row) => Flashcard.fromSupabase(row)).toList();
  
  return content.copyWith(quotes: quotes, flashcards: flashcards);
});

final randomContentProvider = FutureProvider<List<Content>>((ref) async {
  final supabase = ref.watch(supabaseProvider);
  
  final response = await supabase
      .from('content')
      .select()
      .eq('is_published', true)
      .order('created_at', ascending: false)
      .limit(50);
  
  final contents = response.map((row) => Content.fromSupabase(row)).toList();
  contents.shuffle();
  return contents;
});

class ContentNotifier extends StateNotifier<AsyncValue<List<Content>>> {
  final SupabaseClient _supabase;
  
  ContentNotifier(this._supabase) : super(const AsyncValue.loading()) {
    loadContents();
  }
  
  Future<void> loadContents() async {
    state = const AsyncValue.loading();
    try {
      final response = await _supabase
          .from('content')
          .select()
          .eq('is_published', true)
          .order('created_at', ascending: false);
      final contents = response.map((row) => Content.fromSupabase(row)).toList();
      state = AsyncValue.data(contents);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> refresh() async {
    await loadContents();
  }
}

final contentNotifierProvider = StateNotifierProvider<ContentNotifier, AsyncValue<List<Content>>>((ref) {
  final supabase = ref.watch(supabaseProvider);
  return ContentNotifier(supabase);
});
