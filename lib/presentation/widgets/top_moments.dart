import 'package:flutter/material.dart';
import '../../data/models/quote.dart';
import '../../core/theme/app_theme.dart';

class TopMoments extends StatelessWidget {
  final List<Quote> quotes;

  const TopMoments({super.key, required this.quotes});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: quotes.asMap().entries.map((entry) {
        final index = entry.key;
        final quote = entry.value;
        return _MomentItem(
          number: index + 1,
          text: quote.text,
          timestamp: quote.timestamp,
        );
      }).toList(),
    );
  }
}

class _MomentItem extends StatelessWidget {
  final int number;
  final String text;
  final String? timestamp;

  const _MomentItem({
    required this.number,
    required this.text,
    this.timestamp,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          child: Text('$number'),
        ),
        title: Text(
          text,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  text,
                  style: const TextStyle(fontSize: 16, height: 1.5),
                ),
                if (timestamp != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        timestamp!,
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
