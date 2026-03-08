import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../data/providers/content_provider.dart';
import '../widgets/artifact_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _currentIndex = 0;
  final PageController _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _shuffleAndShow() {
    ref.invalidate(randomContentProvider);
  }

  @override
  Widget build(BuildContext context) {
    final randomContents = ref.watch(randomContentProvider);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Artifact Foundry'),
        actions: [
          IconButton(
            icon: const Icon(Icons.admin_panel_settings),
            onPressed: () => context.push('/admin'),
          ),
        ],
      ),
      body: randomContents.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _buildErrorState(error),
        data: (contents) {
          if (contents.isEmpty) {
            return _buildEmptyState();
          }
          return PageView.builder(
            controller: _pageController,
            scrollDirection: Axis.vertical,
            itemCount: contents.length,
            onPageChanged: (index) => setState(() => _currentIndex = index),
            itemBuilder: (context, index) {
              final content = contents[index];
              return GestureDetector(
                onTap: () => context.push('/artifact/${content.id}'),
                child: ArtifactCard(
                  content: content,
                  onTap: () => context.push('/artifact/${content.id}'),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton.small(
            heroTag: 'shuffle',
            onPressed: _shuffleAndShow,
            backgroundColor: AppColors.secondary,
            child: const Icon(Icons.shuffle),
          ),
          const SizedBox(height: 8),
          FloatingActionButton(
            heroTag: 'inspire',
            onPressed: _shuffleAndShow,
            child: const Text('Inspire Me', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.auto_stories, size: 80, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            'No artifacts yet',
            style: TextStyle(fontSize: 20, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 8),
          Text(
            'Add content via the Admin panel',
            style: TextStyle(color: Colors.grey.shade500),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => context.push('/admin'),
            icon: const Icon(Icons.add),
            label: const Text('Go to Admin'),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 80, color: AppColors.error),
          const SizedBox(height: 16),
          Text('Error: $error', textAlign: TextAlign.center),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _shuffleAndShow,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
