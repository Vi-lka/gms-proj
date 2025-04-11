import { type MapGroupT, type MapItemT } from "../types";
import { combineArraysWithCommonElements } from "../utils";
import { calculateAverage } from "./get-group-average";
import haveIntersection from "./have-intersection";

export const DEFAULT_ITEM_SIZE = {
  width: 180,
  height: 160
}

export const DEFAULT_INTERSECTION_SIZE = {
  width: 10,
  height: 10,
};

export default function getIntersections(data: MapItemT[], scale: number) {
  const dataGroups: MapGroupT[] = [];

  // Храним информацию о пересечениях
  const intersections = data.map((item) => ({
    current: item,
    intersections: [] as MapItemT[],
  }));

  // Находим пересечения между отдельными элементами
  data.forEach((first) => {
    data.forEach((second) => {
      if (first.id === second.id) return;

      const firstAttrs = {
        x: first.x,
        y: first.y,
        width: DEFAULT_ITEM_SIZE.width * (1 / scale),
        height: DEFAULT_ITEM_SIZE.height * (1 / scale),
      };
      const secondAttrs = {
        x: second.x,
        y: second.y,
        width: DEFAULT_ITEM_SIZE.width * (1 / scale),
        height: DEFAULT_ITEM_SIZE.height * (1 / scale),
      };

      if (haveIntersection(firstAttrs, secondAttrs)) {
        intersections
          .find((item) => item.current.id === first.id)
          ?.intersections.push(second);
      }
    });
  });

  const intersectionItems: MapItemT[][] = [];
  const singleItems: MapItemT[] = [];

  // Формируем массивы пересечений и одиночные элементы
  intersections.forEach((item) => {
    if (item.intersections.length > 0) {
      const arr = [item.current, ...item.intersections].sort((a, b) =>
        a.id.localeCompare(b.id)
      );
      intersectionItems.push(arr);
    } else {
      singleItems.push(item.current);
    }
  });

  // Удаляем дубликаты массивов пересечений
  const setArrs = new Set(intersectionItems.map((item) => JSON.stringify(item)));
  const uniqIntersections = Array.from(setArrs).map(
    (item) => JSON.parse(item) as MapItemT[]
  );

  // Объединяем массивы с общими элементами
  const intersectionGroups = combineArraysWithCommonElements(uniqIntersections);

  // Проверяем пересечения элементов с группами пересечений
  const finalGroups: MapItemT[][] = [...intersectionGroups];

  data.forEach((item) => {
    let addedToGroup = false;

    // Проверяем, не входит ли элемент уже в какую-либо группу
    if (
      finalGroups.some((group) => group.some((groupItem) => groupItem.id === item.id))
    ) {
      return;
    }

    const itemAttrs = {
      x: item.x,
      y: item.y,
      width: DEFAULT_ITEM_SIZE.width * (1 / scale),
      height: DEFAULT_ITEM_SIZE.height * (1 / scale),
    };

    // Проверяем пересечение с каждой группой
    finalGroups.forEach((group, index) => {
      // Вычисляем границы группы с учетом DEFAULT_INTERSECTION_SIZE
      const groupAttrs = {
        x: calculateAverage(group.map(itm => itm.x)),
        y: calculateAverage(group.map(itm => itm.y)),
        width: DEFAULT_INTERSECTION_SIZE.width * (1 / scale),
        height: DEFAULT_INTERSECTION_SIZE.height * (1 / scale),
      };

      if (haveIntersection(itemAttrs, groupAttrs)) {
        finalGroups[index]!.push(item);
        addedToGroup = true;
      }
    });

    // Если элемент не добавлен в группу, проверяем одиночные элементы
    if (!addedToGroup) {
      singleItems.push(item);
    }
  });

  // Формируем группы для рендеринга
  finalGroups.forEach((group) => {
    if (group.length > 1) {
      dataGroups.push({ intersection: true, items: group });
    } else if (group.length === 1) {
      dataGroups.push({ intersection: false, data: group[0]! });
    }
  });

  // Добавляем одиночные элементы
  singleItems.forEach((item) => {
    if (
      !dataGroups.some(
        (group) =>
          (group.intersection && group.items?.some((i) => i.id === item.id)) ||
          (!group.intersection && group.data?.id === item.id)
      )
    ) {
      dataGroups.push({ intersection: false, data: item });
    }
  });

  // Удаляем дубликаты групп
  const uniqDataGroups = dataGroups.filter((obj, index, arr) => {
    return (
      arr.findIndex((o) => {
        return JSON.stringify(o) === JSON.stringify(obj);
      }) === index
    );
  });

  return uniqDataGroups;
}