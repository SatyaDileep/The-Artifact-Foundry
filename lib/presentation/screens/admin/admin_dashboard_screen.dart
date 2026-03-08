import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../data/providers/content_provider.dart';
import '../../data/models/content.dart';
import '../../data/models/quote.dart';
import '../../data/models/flashcard.dart';
import 'package:uuid/uuid.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _titleController = TextEditingController();
  final _sourceUrlController = TextEditingController();
  final _transcriptController = TextEditingController();
  String _selectedCategory = AppConstants.categories.first;
  String _selectedPlatform = 'YouTube';
  bool _isGenerating = false;
  List<Map<String, dynamic>> _generatedQuotes = [];
  List<Map<String, dynamic>> _generatedFlashcards = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _titleController.dispose();
    _sourceUrlController.dispose();
    _transcriptController.dispose();
    super.dispose();
  }

  Future<void> _generateWithAI() async {
    if (_transcriptController.text.isEmpty && _sourceUrlController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a transcript or YouTube URL')),
      );
      return;
    }

    setState(() => _isGenerating = true);

    try {
      final supabase = ref.read(supabaseProvider);
      
      final response = await supabase.functions.invoke('generate-artifact', {
        body: {
          'transcript': _transcriptController.text,
          'sourceUrl': _sourceUrlController.text,
          'category': _selectedCategory,
        },
      });

      if (response.data != null) {
        final data = response.data as Map<String, dynamic>;
        setState(() {
          _generatedQuotes = List<Map<String, dynamic>>.from(data['quotes'] ?? []);
          _generatedFlashcards = List<Map<String, dynamic>>.from(data['flashcards'] ?? []);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error generating content: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isGenerating = false);
      }
    }
  }

  Future<void> _saveContent() async {
    if (_titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a title')),
      );
      return;
    }

    try {
      final supabase = ref.read(supabaseProvider);
      final uuid = const Uuid();

      final contentId = uuid.v4();
      
      await supabase.from('content').insert({
        'id': contentId,
        'title': _titleController.text,
        'source_url': _sourceUrlController.text.isNotEmpty 
            ? _sourceUrlController.text 
            : null,
        'platform': _selectedPlatform,
        'is_published': true,
      });

      if (_generatedQuotes.isNotEmpty) {
        final quotesData = _generatedQuotes.map((q) => {
          'id': uuid.v4(),
          'content_id': contentId,
          'text': q['text'],
          'timestamp': q['timestamp'],
        }).toList();
        await supabase.from('quotes').insert(quotesData);
      }

      if (_generatedFlashcards.isNotEmpty) {
        final flashcardsData = _generatedFlashcards.map((f) => {
          'id': uuid.v4(),
          'content_id': contentId,
          'front': f['front'],
          'back': f['back'],
        }).toList();
        await supabase.from('flashcards').insert(flashcardsData);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Content saved successfully!')),
        );
        _clearForm();
        ref.invalidate(contentsProvider);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving content: $e')),
        );
      }
    }
  }

  void _clearForm() {
    _titleController.clear();
    _sourceUrlController.clear();
    _transcriptController.clear();
    setState(() {
      _generatedQuotes = [];
      _generatedFlashcards = [];
    });
  }

  @override
  Widget build(BuildContext context) {
    final contents = ref.watch(contentsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Create', icon: Icon(Icons.add)),
            Tab(text: 'Manage', icon: Icon(Icons.list)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCreateTab(),
          _buildManageTab(contents),
        ],
      ),
    );
  }

  Widget _buildCreateTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(
              labelText: 'Title',
              hintText: 'Enter artifact title',
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedCategory,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: AppConstants.categories
                      .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedCategory = v!),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedPlatform,
                  decoration: const InputDecoration(labelText: 'Platform'),
                  items: ['YouTube', 'Spotify', 'Web', 'Podcast']
                      .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedPlatform = v!),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _sourceUrlController,
            decoration: const InputDecoration(
              labelText: 'Source URL',
              hintText: 'https://...',
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _transcriptController,
            maxLines: 6,
            decoration: const InputDecoration(
              labelText: 'Transcript',
              hintText: 'Paste your transcript here...',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isGenerating ? null : _generateWithAI,
              icon: _isGenerating
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.auto_awesome),
              label: Text(_isGenerating ? 'Generating...' : 'Generate with AI'),
            ),
          ),
          if (_generatedQuotes.isNotEmpty || _generatedFlashcards.isNotEmpty) ...[
            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 16),
            if (_generatedQuotes.isNotEmpty) ...[
              const Text('Generated Quotes',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ..._generatedQuotes.asMap().entries.map((entry) {
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.primary,
                      child: Text('${entry.key + 1}'),
                    ),
                    title: Text(entry.value['text'] ?? ''),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () {
                        setState(() => _generatedQuotes.removeAt(entry.key));
                      },
                    ),
                  ),
                );
              }),
            ],
            if (_generatedFlashcards.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('Generated Flashcards',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ..._generatedFlashcards.asMap().entries.map((entry) {
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.secondary,
                      child: Text('${entry.key + 1}'),
                    ),
                    title: Text(entry.value['front'] ?? ''),
                    subtitle: Text(entry.value['back'] ?? ''),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () {
                        setState(() => _generatedFlashcards.removeAt(entry.key));
                      },
                    ),
                  ),
                );
              }),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _saveContent,
                icon: const Icon(Icons.save),
                label: const Text('Save & Publish'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildManageTab(AsyncValue<List<Content>> contents) {
    return contents.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => Center(child: Text('Error: $error')),
      data: (data) {
        if (data.isEmpty) {
          return const Center(child: Text('No content yet'));
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: data.length,
          itemBuilder: (context, index) {
            final content = data[index];
            return Card(
              child: ListTile(
                title: Text(content.title),
                subtitle: Text(content.platform ?? 'Unknown'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      content.isPublished ? Icons.check_circle : Icons.pending,
                      color: content.isPublished ? AppColors.success : Colors.orange,
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _deleteContent(content),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _deleteContent(Content content) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Content'),
        content: Text('Delete "${content.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(supabaseProvider).from('content').delete().eq('id', content.id);
      ref.invalidate(contentsProvider);
    }
  }
}
